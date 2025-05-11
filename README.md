# Chefhai: Your Personal Cooking App

**Chefhai is your companion in the kitchen, designed to help you discover, create, and share amazing culinary experiences.** Whether you're looking for inspiration, need help generating detailed recipes from a photo, or want to connect with a community of food lovers, Chefhai has you covered.

This mobile application allows users to generate detailed recipes, including ingredients, calorie counts, and step-by-step instructions, simply by uploading an image of a dish. It also features a vibrant forum where users can share their own recipes, discuss cooking techniques, and engage with fellow food enthusiasts.

## Table of Contents

- [Chefhai: Your Personal Cooking App](#chefhai-your-personal-cooking-app)
  - [Table of Contents](#table-of-contents)
  - [Features](#features)
  - [Screenshots / Demo](#screenshots--demo)
  - [Tech Stack](#tech-stack)
  - [Installation](#installation)
  - [Usage](#usage)
  - [Configuration](#configuration)
  - [API Reference / Key Supabase Interactions](#api-reference--key-supabase-interactions)
    - [Supabase Tables:](#supabase-tables)
    - [Supabase Storage Buckets:](#supabase-storage-buckets)
    - [Supabase Edge Functions:](#supabase-edge-functions)
    - [Supabase Auth:](#supabase-auth)
  - [Architecture / Folder Structure](#architecture--folder-structure)
  - [Contributors](#contributors)

## Features

*   **AI-Powered Recipe Generation**: Upload a photo of a dish, and Chefhai (powered by Google Gemini) will generate a detailed recipe, including:
    *   Ingredients list
    *   Step-by-step cooking instructions
    *   Estimated calorie count and nutritional information
    *   Cooking time and skill level
*   **Comprehensive Recipe Details**: View recipes with clear instructions, ingredient lists, nutritional information, and cooking steps.
*   **Interactive Cooking Mode**: Follow recipes step-by-step with a dedicated cooking session interface.
*   **Community Forum**:
    *   Share your own recipes and cooking experiences.
    *   Discover recipes shared by other users.
    *   Like, save (bookmark), and comment on posts.
*   **User Profiles**: Manage your profile, view your created recipes, liked posts, and bookmarked recipes.
*   **Search & Discovery**: Easily find recipes and forum posts.
*   **Authentication**: Secure user sign-up and login.

## Screenshots / Demo



## Tech Stack

*   **Frontend**:
    *   React Native
    *   Expo (Managed Workflow)
    *   TypeScript
    *   Expo Router (for navigation)
    *   NativeWind (Tailwind CSS for React Native)
    *   React Query (`@tanstack/react-query` for server state management)
*   **Backend & Database (BaaS)**:
    *   Supabase
        *   PostgreSQL Database
        *   Authentication
        *   Storage (for food images, user avatars)
        *   Edge Functions (for `gemini-food-analyze`)
*   **Artificial Intelligence**:
    *   Google Gemini (via Supabase Edge Function)
*   **Styling**:
    *   Tailwind CSS (via NativeWind)
*   **State Management**:
    *   React Context API (for Auth state)
    *   React Query (for server state, caching, etc.)
*   **Development Tools**:
    *   ESLint
    *   Babel

## Installation

Follow these steps to set up the project locally:

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/your-username/chefhai.git
    cd chefhai
    ```

2.  **Install dependencies**:
    Using npm:
    ```bash
    npm install
    ```
    Or using Yarn:
    ```bash
    yarn install
    ```

3.  **Set up Environment Variables**:
    *   Create a `.env` file in the root of the project.
    *   Add your Supabase project URL and Anon key:
        ```env
        EXPO_PUBLIC_SUPABASE_PROJECT_URL=your_supabase_project_url
        EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
        ```
    *   You will also need to set up the `gemini-food-analyze` Supabase Edge Function with your Google Gemini API key.

4.  **(Optional) Reset Project Cache (if needed)**:
    ```bash
    npm run reset-project
    ```

## Usage

To run the project locally:

1.  **Start the Expo development server**:
    Using npm:
    ```bash
    npm start
    ```
    Or using Yarn:
    ```bash
    yarn start
    ```

2.  This will open the Expo Developer Tools in your browser. From there, you can:
    *   Press `a` to run on an Android emulator or connected device.
    *   Press `i` to run on an iOS simulator or connected device (macOS only).
    *   Press `w` to run in a web browser.

    You can also scan the QR code with the Expo Go app on your mobile device.

## Configuration

The primary configuration is done through a `.env` file in the project root. This file is ignored by Git (see `.gitignore`).

**`.env` file example:**
```env
EXPO_PUBLIC_SUPABASE_PROJECT_URL="https://your-project-ref.supabase.co"
EXPO_PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-public-key"
```

*   `EXPO_PUBLIC_SUPABASE_PROJECT_URL`: Your Supabase project URL.
*   `EXPO_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase public anonymous key.

The Google Gemini API key is expected to be configured within the `gemini-food-analyze` Supabase Edge Function environment variables.

Tailwind CSS (NativeWind) configuration can be found in `tailwind.config.js`.

## API Reference / Key Supabase Interactions

Chefhai heavily relies on Supabase for its backend functionalities.

### Supabase Tables:

*   **`profiles`**: Stores user profile information (username, avatar URL, full name, etc.).
    *   Key columns: `id` (FK to `auth.users.id`), `username`, `avatar_url`, `full_name`.
*   **`foods`**: Stores details about recipes/food items.
    *   Key columns: `id`, `name`, `description`, `time_to_cook_minutes`, `skill_level`, `calories`, `image_url`, `created_by` (FK to `profiles.id`), `is_shared`.
*   **`ingredients`**: Stores ingredients for each food item.
    *   Key columns: `id`, `food_id` (FK to `foods.id`), `name`, `emoji`.
*   **`nutrients`**: Stores nutritional information for each food item.
    *   Key columns: `food_id` (FK to `foods.id`), `fat_g`, `fiber_g`, `protein_g`, `carbs_g`.
*   **`cooking_steps`**: Stores step-by-step instructions for recipes.
    *   Key columns: `id`, `food_id` (FK to `foods.id`), `step_order`, `title`, `description`.
*   **`food_likes`**: Tracks likes on food posts/recipes.
    *   Key columns: `user_id` (FK to `profiles.id`), `food_id` (FK to `foods.id`).
*   **`food_saves`**: Tracks saved/bookmarked food posts/recipes.
    *   Key columns: `user_id` (FK to `profiles.id`), `food_id` (FK to `foods.id`).
*   **`food_comments`**: Stores comments on food posts/recipes.
    *   Key columns: `id`, `user_id` (FK to `profiles.id`), `food_id` (FK to `foods.id`), `content`.

### Supabase Storage Buckets:

*   **`food`**: Stores images uploaded for recipes.
*   **`avatars`**: Stores user profile avatar images.

### Supabase Edge Functions:

*   **`gemini-food-analyze`**:
    *   **Purpose**: Takes an image URL of a food dish as input and uses the Google Gemini API to analyze the image and return structured recipe data (ingredients, steps, nutritional info, etc.).
    *   **Input**: `{ "imageUrl": "string" }`
    *   **Output**: `GenAIResult` (see `types.ts`) containing `foods`, `cooking_steps`, `ingredients`, `nutrients`.

### Supabase Auth:

*   Handles user registration (`signUp`), login (`signInWithPassword`), and session management (`onAuthStateChange`, `signOut`).

## Architecture / Folder Structure

The project follows a standard React Native (Expo) project structure:

```
chefhai/
├── app/                      # Expo Router: Screens, layouts, and navigation
│   ├── (tabs)/               # Tab-based navigation screens (home, recipes, forum, profile)
│   ├── auth/                 # (Conceptual, actual files are login.tsx, signup.tsx)
│   ├── cooking/              # Cooking session screens
│   ├── food/                 # Food detail screens
│   ├── post-detail/          # Forum post detail screens
│   ├── _layout.tsx           # Root layout
│   └── index.tsx             # Entry point for routing, handles auth redirect
├── assets/                   # Static assets (images, fonts)
├── components/               # Reusable UI components
│   └── ui/                   # More specific UI elements (icons, tab bar utils)
├── constants/                # Global constants (e.g., Colors)
├── context/                  # React Context providers (e.g., auth-context.tsx)
├── hooks/                    # Custom React hooks (e.g., use-foods.ts, useColorScheme.ts)
├── services/                 # Business logic, API calls
│   ├── data/                 # Supabase data interaction modules (foods, profile, forum, etc.)
│   ├── gemini.ts             # Service for interacting with Gemini AI (via Supabase function)
│   └── supabase.ts           # Supabase client initialization and configuration
├── types/                    # TypeScript type definitions
├── .env                      # Environment variables (ignored by git)
├── app.json                  # Expo app configuration
├── package.json              # Project dependencies and scripts
├── tailwind.config.js        # NativeWind (Tailwind CSS) configuration
└── tsconfig.json             # TypeScript configuration
```

*   **`app/`**: Contains all screens and navigation logic, managed by Expo Router. Files and folders in this directory define the app's routes.
*   **`components/`**: Houses reusable UI components used across different screens.
*   **`context/`**: Manages global state using React Context (e.g., `auth-context.tsx` for authentication state).
*   **`hooks/`**: Custom React Hooks for encapsulating reusable logic, often related to data fetching or side effects (e.g., `use-foods.ts` uses React Query for forum data).
*   **`services/`**: Contains modules for interacting with external services, primarily Supabase.
    *   `data/`: Specific modules for CRUD operations on different Supabase tables.
    *   `gemini.ts`: Handles the call to the Supabase Edge Function for AI recipe generation.
    *   `supabase.ts`: Initializes the Supabase client.
*   **`types/`**: Defines TypeScript interfaces and types used throughout the application, ensuring type safety.

## Contributors

[Sosokker](https://github.com/Sosokker)
[Tantikorn Prasanpangsee](https://github.com/21Gxme)