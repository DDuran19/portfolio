<h1 class="text-balance">Simple vanilla login</h1>

![Simple Vanilla Login](https://raw.githubusercontent.com/DDuran19/images/main/SimpleVanillaLogin/root.webp)

This webapp is a simple login form that uses pure vanilla Typescript and CSS. It was originally built using Supabase, but now uses dummyjson api for the users database. The webapp includes a logo, username and password inputs, a submit button, and a link to register for an account.

Route management is achieved without the need for external libraries or intricate code structures.

## Key features

- Simple and easy to use
- Built with pure vanilla Typescript and CSS
- Uses dummyjson api for the users database
- Implements route protection thru session data.

## Usage

1. Familiarize yourself with the UI: The top navigation provides test links to navigate to specific sections of the page.

2. Login using the provided account list: On the homepage, use the login form on the right side to access the application using the provided list of accounts.

3. View account details: Upon successful login, you should be able to see the account details of the logged-in user.

4. Free access to all routes: Once logged in, you can freely navigate to all routes, including the `/UserDetails` page.

5. Logout and route protection: On the `/UserDetails` page, clicking the 'Sign Out' button will log you out and restrict you from accessing the `/UserDetails` page again.
