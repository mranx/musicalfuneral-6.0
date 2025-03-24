'use client';

export default function AdminLoading() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white dark:bg-gray-950">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
    </div>
  );
}