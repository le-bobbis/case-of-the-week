interface ButtonProps {
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'success';
  children: React.ReactNode;
  disabled?: boolean;
}

export default function Button({ onClick, variant = 'primary', children, disabled = false }: ButtonProps) {
  const baseClasses = "px-6 py-3 rounded-lg font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variantClasses = {
    primary: "bg-gradient-to-r from-red-800 to-red-600 text-white hover:from-red-700 hover:to-red-500 hover:-translate-y-1 shadow-lg",
    secondary: "bg-gradient-to-r from-blue-800 to-blue-600 text-white hover:from-blue-700 hover:to-blue-500 hover:-translate-y-1 shadow-lg",
    success: "bg-gradient-to-r from-green-800 to-green-600 text-white hover:from-green-700 hover:to-green-500 hover:-translate-y-1 shadow-lg"
  };

  return (
    <button 
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]}`}
    >
      {children}
    </button>
  );
}