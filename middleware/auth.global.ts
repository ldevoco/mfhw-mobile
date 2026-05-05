import { authService } from '~/services/auth.service';

export default defineNuxtRouteMiddleware(async (to) => {
  const publicRoutes = [
    '/',
    '/audio',
    '/number',
    '/resources',
    '/tts',
    '/login',
    '/register',
  ];

  // Skip auth check for public routes
  if (publicRoutes.includes(to.path)) return;

  // Check if authenticated
  if (!authService.isAuthenticated()) {
    return navigateTo('/login');
  }

  // Verify token is still valid (optional)
  try {
    // You could add token validation here
  } catch (error) {
    await authService.logout();
    return navigateTo('/login');
  }
});
