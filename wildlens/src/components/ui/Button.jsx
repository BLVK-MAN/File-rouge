import React from 'react';

const Button = ({ children, variant = 'primary', className = '', ...props }) => {
    const baseStyles = "px-4 py-2 rounded-md font-semibold transition-colors duration-200 flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-offset-2";

    const variants = {
        primary: "bg-primary text-white hover:bg-green-800 focus:ring-primary",
        secondary: "bg-secondary text-white hover:bg-yellow-600 focus:ring-secondary",
        outline: "border-2 border-primary text-primary hover:bg-primary hover:text-white focus:ring-primary",
    };

    return (
        <button
            className={`${baseStyles} ${variants[variant]} ${className}`}
            {...props}
        >
            {children}
        </button>
    );
};

export default Button;
