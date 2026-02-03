<a id="readme-top"></a>
<br />
<div align="center">

<h3 align="center">Rhythmic</h3>

<p align="center">
A web application for managing and organizing music playlists across multiple platforms.
<br />
Users can create, version, split, and synchronize playlists while identifying duplicate tracks.
<br />
<br />
<a href="https://github.com/ARKTEEK/Rhythmic"><strong>View Demo »</strong></a>
</p>

</div>

---

## Table of Contents

<details>
  <summary>Expand</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#core-features">Core Features</a></li>
        <li><a href="#built-with">Built With</a></li>
      </ul>
    </li>
    <li>
      <a href="#architecture">Architecture</a>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#installation">Installation</a></li>
      </ul>
    </li>
    <li><a href="#usage">Usage</a></li>
  </ol>
</details>

---

## About The Project

## Core Features

- Playlist creation and editing
- Playlist transfer from one platfrom to another
- Cross-platform playlist synchronization
- Playlist version control
- Splitting large playlists into smaller ones
- Duplicate track detection

## Built With

### Frontend
- React
- TypeScript
- Vite

### Backend
- .NET 9
- ASP.NET Core Web API
- Entity Framework Core

### Database
- MySQL

<p align="right">(<a href="#readme-top">back to top</a>)</p>

---

## Architecture

- **Frontend**: React SPA written in TypeScript, responsible for UI state and API communication.
- **Backend**: ASP.NET Core Web API exposing RESTful endpoints.
- **Data Access**: Entity Framework Core with code-first migrations.
- **Configuration**:
  - Frontend: `.env` files
  - Backend: `appsettings.json`

<p align="right">(<a href="#readme-top">back to top</a>)</p>

---

<!-- GETTING STARTED -->
## Getting Started

### Prerequisites

Ensure the following are installed:

- Node.js (LTS)
- npm
- .NET SDK 9.0
- MySQL Server

### Installation

1. Clone the repo
   ```sh
   git clone https://github.com/ARKTEEK/Rhythmic.git
   ```
2. Update configuration settings for backend in `./backend/appsettings.json`
3. Update configuration settings for frontend in `./frontend/.env`
4. Install frontend dependencies
   ```sh
   cd ./frontend
   npm install
   ```
5. Restore backend dependencies
   ```sh
   cd ./backend
   dotnet restore
   ```
6. Apply database migrations:
   ```sh
   dotnet ef database update
   ```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

---

<!-- USAGE EXAMPLES -->
## Usage

1. Start the backend server
   ```sh
   cd ./backend
   dotnet run
   ```
2. Start the frontend server
   ```sh
   cd ./frontend
   npm run dev
   ```
3. Open in a browser:
   ```sh
   https://localhost:5173
   ```

<p align="right">(<a href="#readme-top">back to top</a>)</p>
