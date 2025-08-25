import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// Определяем защищенные маршруты
const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/profile(.*)',
  '/admin(.*)',
  '/checkout(.*)',
  '/orders(.*)',
]);

export default clerkMiddleware(async (auth, req) => {
  // Защищаем маршруты, требующие аутентификации
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Применяем middleware ко всем маршрутам, кроме статических файлов и API
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Включаем API routes
    '/(api|trpc)(.*)',
  ],
};