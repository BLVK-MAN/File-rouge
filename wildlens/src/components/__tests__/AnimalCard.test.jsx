import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import AnimalCard from '../AnimalCard';

// Need to mock Framer Motion since it can cause issues in Jest
jest.mock('framer-motion', () => {
    const ActualFramerMotion = jest.requireActual('framer-motion');
    return {
        ...ActualFramerMotion,
        motion: {
            div: ({ children, className, ...props }) => {
                // Remove framer-motion props to avoid React warnings in standard DOM elements
                const { layout, initial, animate, transition, whileHover, ...validProps } = props;
                return <div className={className} {...validProps}>{children}</div>;
            },
        },
    };
});

// Need to mock Button since it might have Link/Router dependencies depending on implementation
jest.mock('../ui/Button', () => {
    return ({ children, className }) => <button className={className}>{children}</button>;
});

describe('AnimalCard Component', () => {
    const mockAnimal = {
        id: "1",
        name: "Lion d'Afrique",
        habitat: "Savane",
        description: "Le roi de la savane.",
        image_url: "https://example.com/lion.jpg"
    };

    it('renders animal information correctly', () => {
        render(<AnimalCard animal={mockAnimal} index={0} />);

        // Check if the name is displayed
        expect(screen.getByText("Lion d'Afrique")).toBeInTheDocument();

        // Check if the habitat is displayed
        expect(screen.getByText("Savane")).toBeInTheDocument();

        // Check if the description is displayed
        expect(screen.getByText("Le roi de la savane.")).toBeInTheDocument();

        // Check if the image has the correct src and alt
        const image = screen.getByRole('img');
        expect(image).toHaveAttribute('src', 'https://example.com/lion.jpg');
        expect(image).toHaveAttribute('alt', "Lion d'Afrique");
    });

    it('uses the first image from image_urls array if available', () => {
        const mockAnimalWithGallery = {
            ...mockAnimal,
            image_urls: ["https://example.com/gallery1.jpg", "https://example.com/gallery2.jpg"]
        };

        render(<AnimalCard animal={mockAnimalWithGallery} index={0} />);

        const image = screen.getByRole('img');
        expect(image).toHaveAttribute('src', 'https://example.com/gallery1.jpg');
    });
});
