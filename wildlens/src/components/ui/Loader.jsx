import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

const Loader = ({ className = '' }) => {
    const loaderRef = useRef(null);

    useEffect(() => {
        // Animation GSAP simple et fluide (rotation continue)
        gsap.to(loaderRef.current, {
            rotation: 360,
            repeat: -1,
            duration: 1,
            ease: "linear",
        });
    }, []);

    return (
        <div className={`flex justify-center items-center ${className}`}>
            <div
                ref={loaderRef}
                className="w-8 h-8 border-4 border-gray-200 border-t-primary rounded-full"
            />
        </div>
    );
};

export default Loader;
