# Admin Laboratory API Documentation

This document contains detailed information on all available endpoints in the Admin Laboratory API, including the base URL, HTTP methods, headers, request bodies, success responses, and common errors.

---

## 🌐 General Information

### Base URL
* **Development**: `http://localhost:5000/api`

### Authentication
Most endpoints are secured. To access secured resources, provide a JSON Web Token (JWT) in the `Authorization` header:
```http
Authorization: Bearer <your_access_token>
```
*Access tokens expire after **15 minutes**. Use the `/auth/refresh` endpoint to acquire a new access token using your refresh token.*

---

## 🔑 Authentication Endpoints (`/auth`)

### 1. General User Registration
Register a new user (Laboran or general user).
* **Method**: `POST`
* **URL**: `/auth/register`
* **Headers**: `Content-Type: application/json`
* **Request Body**:
  ```json
  {
    "username": "lab_manager",
    "email": "manager@admin.com",
    "password": "securePassword123",
    "nama_lengkap": "Budi Santoso",
    "profileUrl": "https://example.com/profiles/budi.jpg",
    "nomor_telepon": "081234567890"
  }
  ```
* **Success Response (201 Created)**:
  ```json
  {
    "success": true,
    "message": "User registered successfully.",
    "data": {
      "user": {
        "id": "7ac67c7e-b6e9-4e78-831e-15104d4f8fb2",
        "username": "lab_manager",
        "email": "manager@admin.com",
        "nama_lengkap": "Budi Santoso",
        "profileUrl": "https://example.com/profiles/budi.jpg",
        "nomor_telepon": "081234567890",
        "id_laboratorium": null,
        "id_role": null,
        "createdAt": "2026-07-14T07:10:00.000Z",
        "updatedAt": "2026-07-14T07:10:00.000Z",
        "laboratorium": null,
        "role": null
      },
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  }
  ```
* **Error Response (400 Bad Request - Uniqueness Violation)**:
  ```json
  {
    "success": false,
    "message": "Username already in use."
  }
  ```

### 2. User Login
Authenticate credentials. Accepts username or email in the `login` field.
* **Method**: `POST`
* **URL**: `/auth/login`
* **Headers**: `Content-Type: application/json`
* **Request Body**:
  ```json
  {
    "login": "lab_manager",
    "password": "securePassword123"
  }
  ```
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Logged in successfully.",
    "data": {
      "user": {
        "id": "7ac67c7e-b6e9-4e78-831e-15104d4f8fb2",
        "username": "lab_manager",
        "email": "manager@admin.com",
        "nama_lengkap": "Budi Santoso",
        "profileUrl": "https://example.com/profiles/budi.jpg",
        "nomor_telepon": "081234567890",
        "id_laboratorium": null,
        "id_role": null,
        "createdAt": "2026-07-14T07:10:00.000Z",
        "updatedAt": "2026-07-14T07:10:00.000Z",
        "laboratorium": null,
        "role": null
      },
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  }
  ```
* **Error Response (401 Unauthorized - Invalid Credentials)**:
  ```json
  {
    "success": false,
    "message": "Invalid credentials."
  }
  ```

### 3. Refresh Access Token (Token Rotation)
Get a new access token and a new rotated refresh token using an active refresh token.
* **Method**: `POST`
* **URL**: `/auth/refresh`
* **Headers**: `Content-Type: application/json`
* **Request Body**:
  ```json
  {
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
  ```
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Token refreshed successfully.",
    "data": {
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9_NEW_ACCESS...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9_NEW_ROTATED..."
    }
  }
  ```
* **Error Response (401 Unauthorized - Expired Refresh Token)**:
  ```json
  {
    "success": false,
    "message": "Invalid or expired refresh token."
  }
  ```

### 4. Logout User
Revoke the refresh token from the database.
* **Method**: `POST`
* **URL**: `/auth/logout`
* **Headers**: `Content-Type: application/json`
* **Request Body**:
  ```json
  {
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
  ```
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Logged out successfully."
  }
  ```

### 5. Fetch Logged-in User Profile
Retrieve token owner's account payload.
* **Method**: `GET`
* **URL**: `/auth/me`
* **Headers**: `Authorization: Bearer <access_token>`
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "user": {
        "id": "7ac67c7e-b6e9-4e78-831e-15104d4f8fb2",
        "username": "lab_manager",
        "email": "manager@admin.com",
        "nama_lengkap": "Budi Santoso",
        "profileUrl": "https://example.com/profiles/budi.jpg",
        "id_laboratorium": null,
        "id_role": null,
        "nomor_telepon": "081234567890",
        "createdAt": "2026-07-14T07:10:00.000Z",
        "updatedAt": "2026-07-14T07:10:00.000Z",
        "laboratorium": null,
        "role": null
      }
    }
  }
  ```
* **Error Response (401 Unauthorized - Missing Token)**:
  ```json
  {
    "success": false,
    "message": "Access denied. No token provided."
  }
  ```

---

## 🧪 Laboran Endpoints (`/laboran`)

### 1. Register New Assistant
Restricted to users with the **Laboran** role. Register a user under the `'Asisten'` role.
* **Method**: `POST`
* **URL**: `/laboran/register-asisten`
* **Headers**: 
  - `Authorization: Bearer <laboran_access_token>`
  - `Content-Type: application/json`
* **Request Body**:
  ```json
  {
    "username": "asisten_tono",
    "email": "tono@admin.com",
    "password": "asistenPassword123",
    "nama_lengkap": "Tono Wijaya",
    "profileUrl": "https://example.com/profiles/tono.jpg",
    "nomor_telepon": "081234567891",
    "id_laboratorium": "d3b07384-d113-41e9-a7e8-e21501b17a10"
  }
  ```
  *(Note: `id_laboratorium` defaults to the laboran's own laboratory if omitted)*
* **Success Response (201 Created)**:
  ```json
  {
    "success": true,
    "message": "Assistant registered successfully.",
    "data": {
      "user": {
        "id": "2b9a7c6f-a9de-4b13-ba14-5d51381deac0",
        "username": "asisten_tono",
        "email": "tono@admin.com",
        "nama_lengkap": "Tono Wijaya",
        "profileUrl": "https://example.com/profiles/tono.jpg",
        "id_role": "asisten-role-uuid",
        "nomor_telepon": "081234567891",
        "createdAt": "2026-07-14T07:11:00.000Z",
        "updatedAt": "2026-07-14T07:11:00.000Z",
        "laboratorium": {
          "id": "d3b07384-d113-41e9-a7e8-e21501b17a10",
          "kode": "E1",
          "nama": "Laboratorium E1"
        },
        "role": {
          "id": "asisten-role-uuid",
          "nama": "Asisten"
        }
      }
    }
  }
  ```
* **Error Response (403 Forbidden - Not a Laboran)**:
  ```json
  {
    "success": false,
    "message": "Forbidden. This action requires one of the following roles: Laboran"
  }
  ```

### 2. Get All Assistants
Retrieve list of all registered laboratory assistants. Restricted to users with the **Laboran** role.
* **Method**: `GET`
* **URL**: `/laboran/asisten`
* **Headers**:
  - `Authorization: Bearer <laboran_access_token>`
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "2b9a7c6f-a9de-4b13-ba14-5d51381deac0",
        "username": "asisten_tono",
        "email": "tono@admin.com",
        "nama_lengkap": "Tono Wijaya",
        "profileUrl": "https://example.com/profiles/tono.jpg",
        "id_role": "asisten-role-uuid",
        "nomor_telepon": "081234567891",
        "createdAt": "2026-07-14T07:11:00.000Z",
        "updatedAt": "2026-07-14T07:11:00.000Z",
        "laboratorium": {
          "id": "d3b07384-d113-41e9-a7e8-e21501b17a10",
          "kode": "E1",
          "nama": "Laboratorium E1"
        },
        "role": {
          "id": "asisten-role-uuid",
          "nama": "Asisten"
        }
      }
    ]
  }
  ```

### 3. Update Assistant's Laboratory
Assign or change the laboratory of a specific assistant. Restricted to users with the **Laboran** role.
* **Method**: `PUT`
* **URL**: `/laboran/asisten/:id/laboratorium`
* **Headers**:
  - `Authorization: Bearer <laboran_access_token>`
  - `Content-Type: application/json`
* **Request Body**:
  ```json
  {
    "id_laboratorium": "d3b07384-d113-41e9-a7e8-e21501b17a10"
  }
  ```
  *(Note: Send `null` to remove the assistant from any laboratory)*
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Assistant's laboratory updated successfully.",
    "data": {
      "user": {
        "id": "2b9a7c6f-a9de-4b13-ba14-5d51381deac0",
        "username": "asisten_tono",
        "email": "tono@admin.com",
        "nama_lengkap": "Tono Wijaya",
        "profileUrl": "https://example.com/profiles/tono.jpg",
        "id_role": "asisten-role-uuid",
        "nomor_telepon": "081234567891",
        "createdAt": "2026-07-14T07:11:00.000Z",
        "updatedAt": "2026-07-15T06:40:00.000Z",
        "laboratorium": {
          "id": "d3b07384-d113-41e9-a7e8-e21501b17a10",
          "kode": "E1",
          "nama": "Laboratorium E1"
        },
        "role": {
          "id": "asisten-role-uuid",
          "nama": "Asisten"
        }
      }
    }
  }
  ```

---


## 💼 Asisten Endpoints (`/asisten`)

### 1. Update Profile
Restricted to users with the **Asisten** role. Allows assistants to update their self-profile properties.
* **Method**: `PUT`
* **URL**: `/asisten/profile`
* **Headers**:
  - `Authorization: Bearer <assistant_access_token>`
  - `Content-Type: application/json`
* **Request Body** (All fields optional):
  ```json
  {
    "nama_lengkap": "Tono Wijaya M.T.",
    "nomor_telepon": "089876543210"
  }
  ```
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Profile updated successfully.",
    "data": {
      "user": {
        "id": "2b9a7c6f-a9de-4b13-ba14-5d51381deac0",
        "username": "asisten_tono",
        "email": "tono@admin.com",
        "nama_lengkap": "Tono Wijaya M.T.",
        "profileUrl": "https://example.com/profiles/tono.jpg",
        "id_role": "asisten-role-uuid",
        "nomor_telepon": "089876543210",
        "createdAt": "2026-07-14T07:11:00.000Z",
        "updatedAt": "2026-07-14T07:12:00.000Z",
        "laboratorium": {
          "id": "d3b07384-d113-41e9-a7e8-e21501b17a10",
          "kode": "E1",
          "nama": "Laboratorium E1"
        },
        "role": {
          "id": "asisten-role-uuid",
          "nama": "Asisten"
        }
      }
    }
  }
  ```

---

## 🏛️ Laboratorium CRUD (`/laboratorium`)

* **GET** `/laboratorium` - List all laboratories (Open to all authenticated users).
* **GET** `/laboratorium/:id` - Fetch single laboratory details (Open to all authenticated users).
* **POST** `/laboratorium` - Create laboratory (Restricted to `'Laboran'`).
  * Body: `{"kode": "E1", "nama": "Laboratorium E1"}`
* **PUT** `/laboratorium/:id` - Update laboratory (Restricted to `'Laboran'`).
  * Body: `{"nama": "Laboratorium E1 Updated"}`
* **DELETE** `/laboratorium/:id` - Delete laboratory (Restricted to `'Laboran'`).

---

## 📄 BAP CRUD (`/bap`)

* **GET** `/bap` - List all reports.
* **GET** `/bap/:id` - Get BAP by ID.
* **POST** `/bap` - Create a report (authenticated).
  * Body:
    ```json
    {
      "tanggal": "2026-07-14",
      "jam_masuk": "08:00:00",
      "jam_keluar": "12:00:00",
      "jumlah_jam": 4,
      "deskripsi_pekerjaan": "Membantu praktikum mandiri",
      "paraf": 1,
      "type": "kegiatan",
      "id_laboratorium": "laboratorium-uuid"
    }
    ```
* **PUT** `/bap/:id` - Update report (Restricted to owner or Laboran).
* **DELETE** `/bap/:id` - Delete report (Restricted to owner or Laboran).

---

## 📦 Lokasi CRUD (`/lokasi`)

* **GET** `/lokasi` - List all locations.
* **GET** `/lokasi/:id` - Fetch single location details.
* **POST** `/lokasi` - Create location (Restricted to `'Laboran'`).
  * Body: `{"nama": "Gedung A Ruang 203"}`
* **PUT** `/lokasi/:id` - Update location (Restricted to `'Laboran'`).
* **DELETE** `/lokasi/:id` - Delete location (Restricted to `'Laboran'`).

---

## 🏷️ Kategori CRUD (`/kategori`)

* **GET** `/kategori` - List all categories.
* **GET** `/kategori/:id` - Fetch single category details.
* **POST** `/kategori` - Create category (Restricted to `'Laboran'`).
  * Body: `{"nama": "Perkakas"}`
* **PUT** `/kategori/:id` - Update category (Restricted to `'Laboran'`).
* **DELETE** `/kategori/:id` - Delete category (Restricted to `'Laboran'`).

---

## 🔍 Barang Hilang CRUD (`/barang-hilang`)

* **GET** `/barang-hilang` - List all lost items.
* **GET** `/barang-hilang/:id` - Fetch lost item by ID.
* **POST** `/barang-hilang` - Report a lost item (Open to all authenticated users).
  * Body:
    ```json
    {
      "nama": "Kalkulator Casio",
      "lokasi_penemuan": "Meja Lab B2",
      "ditemukan_oleh": "Tono",
      "tanggal_ditemukan": "2026-07-14",
      "lokasi_penyimpanan": "Loker B2"
    }
    ```
* **PUT** `/barang-hilang/:id` - Update lost item details.
* **DELETE** `/barang-hilang/:id` - Delete lost item entry.

---

## 📦 Barang CRUD (`/barang`)

* **GET** `/barang` - List all items. Returns an array of items where `laboratorium`, `lokasi`, and `kategori` are replaced with their text names.
  * Response format:
    ```json
    {
      "success": true,
      "data": [
        {
          "id": "item-uuid",
          "nama": "Solder Listrik 60W",
          "jumlah": 10,
          "status": "Baik",
          "laboratorium": "Laboratorium E1",
          "lokasi": "Gedung A Ruang 203",
          "kategori": "Perkakas",
          "createdAt": "2026-07-15T06:21:00.000Z",
          "updatedAt": "2026-07-15T06:21:00.000Z"
        }
      ]
    }
    ```
* **GET** `/barang/:id` - Fetch single item details by ID.
* **POST** `/barang` - Create a new item (Open to `'Laboran'` and `'Asisten'`).
  * Body:
    ```json
    {
      "nama": "Solder Listrik 60W",
      "jumlah": 10,
      "status": "Baik",
      "id_laboratorium": "laboratorium-uuid",
      "id_lokasi": "lokasi-uuid",
      "id_kategori": "kategori-uuid"
    }
    ```
  * Note: `status` defaults to `"Baik"`. Allowed values are `"Baik"`, `"Rusak Ringan"`, and `"Rusak Berat"`.
* **PUT** `/barang/:id` - Update item details (Open to `'Laboran'` and `'Asisten'`).
  * Body (All fields optional):
    ```json
    {
      "nama": "Solder Listrik 60W Updated",
      "jumlah": 12,
      "status": "Rusak Ringan",
      "id_laboratorium": "new-laboratorium-uuid",
      "id_lokasi": "new-lokasi-uuid",
      "id_kategori": "new-kategori-uuid"
    }
    ```
* **DELETE** `/barang/:id` - Delete item (Open to `'Laboran'` and `'Asisten'`).

