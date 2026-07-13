import Swal from 'sweetalert2';

export const showSuccessAlert = (title: string, text: string) => {
  const isDark = typeof document !== 'undefined' && document.documentElement.classList.contains('dark');
  return Swal.fire({
    title,
    text,
    icon: 'success',
    background: isDark ? '#121214' : '#ffffff',
    color: isDark ? '#ffffff' : '#09090b',
    confirmButtonColor: '#6A2D3D',
  });
};

export const showErrorAlert = (title: string, text: string) => {
  const isDark = typeof document !== 'undefined' && document.documentElement.classList.contains('dark');
  return Swal.fire({
    title,
    text,
    icon: 'error',
    background: isDark ? '#121214' : '#ffffff',
    color: isDark ? '#ffffff' : '#09090b',
    confirmButtonColor: '#6A2D3D',
  });
};

export const showSuccessToast = (title: string) => {
  const isDark = typeof document !== 'undefined' && document.documentElement.classList.contains('dark');
  const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    background: isDark ? '#121214' : '#ffffff',
    color: isDark ? '#ffffff' : '#09090b',
    didOpen: (toast) => {
      toast.onmouseenter = Swal.stopTimer;
      toast.onmouseleave = Swal.resumeTimer;
    }
  });
  return Toast.fire({
    icon: 'success',
    title
  });
};

export const showErrorToast = (title: string) => {
  const isDark = typeof document !== 'undefined' && document.documentElement.classList.contains('dark');
  const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    background: isDark ? '#121214' : '#ffffff',
    color: isDark ? '#ffffff' : '#09090b',
    didOpen: (toast) => {
      toast.onmouseenter = Swal.stopTimer;
      toast.onmouseleave = Swal.resumeTimer;
    }
  });
  return Toast.fire({
    icon: 'error',
    title
  });
};
