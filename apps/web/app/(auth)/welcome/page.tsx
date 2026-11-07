'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { OrangeCorner } from '@/components/ui/OrangeCorner';
import { Button } from '@/components/ui/Button';
import { IconSparkles } from '@tabler/icons-react';

export default function WelcomePage() {
  const router = useRouter();
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      title: 'Remember everyone you meet',
      description:
        'Scan a business card and Recallr saves the person, the place you met and what you talked about.',
      tag: 'Who is Ramesh?',
    },
    {
      title: 'Ask your network anything',
      description:
        'Ask who someone is, who you know in an industry, or tell Recallr to add people for you.',
      tag: 'Find suppliers in Rajkot',
    },
    {
      title: 'Never miss a follow-up',
      description:
        'Set reminders on people and get nudged when it has been too long.',
      tag: 'Call Ramesh today 3 PM',
    },
  ];

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      router.push('/sign-in');
    }
  };

  return (
    <div className="min-h-screen bg-bg flex flex-col justify-between max-w-md mx-auto px-6 py-8">
      {/* Top Bar with Skip */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => router.push('/sign-in')}
          className="text-xs font-medium text-textSecondary hover:text-text px-3 py-1.5 rounded-full hover:bg-black/[0.03] transition-colors"
        >
          Skip
        </button>
      </div>

      {/* Center Illustration with Stacked Cards */}
      <div className="my-auto py-8 flex flex-col items-center">
        <div className="relative w-64 h-56 flex items-center justify-center mb-10">
          {/* Back Card rotated -8 deg */}
          <div
            className="absolute w-52 h-36 bg-white rounded-card border border-border shadow-sm transform -rotate-8 -translate-x-3 -translate-y-2 opacity-70"
            style={{ borderRadius: 16 }}
          />

          {/* Front Card rotated +5 deg */}
          <Card
            className="relative w-56 h-40 bg-white border border-border shadow-md transform rotate-5 p-4 flex flex-col justify-between"
            style={{ borderRadius: 16 }}
          >
            <OrangeCorner size="sm">
              <IconSparkles size={14} stroke={2.5} />
            </OrangeCorner>
            <div>
              <div className="w-8 h-8 rounded-full bg-accentTint flex items-center justify-center text-accent font-medium text-xs mb-2">
                RK
              </div>
              <div className="text-sm font-medium text-text">Ramesh Kumar</div>
              <div className="text-[11px] text-textSecondary">Apex Polymers</div>
            </div>
            <div className="text-[10px] text-accent font-medium bg-accentTintSoft px-2 py-0.5 rounded self-start">
              {slides[currentSlide].tag}
            </div>
          </Card>
        </div>

        {/* Slide Content */}
        <div className="text-center space-y-2.5 max-w-sm">
          <h1 className="text-2xl font-medium text-text">
            {slides[currentSlide].title}
          </h1>
          <p className="text-xs sm:text-sm text-textSecondary leading-relaxed">
            {slides[currentSlide].description}
          </p>
        </div>

        {/* Carousel Dots */}
        <div className="flex items-center gap-1.5 mt-8">
          {slides.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setCurrentSlide(idx)}
              className={`h-1.5 rounded-full transition-all ${
                currentSlide === idx ? 'w-5 bg-accent' : 'w-1.5 bg-borderStrong'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Bottom CTA Button */}
      <div className="pt-4">
        <Button
          variant="primary"
          size="md"
          onClick={handleNext}
          style={{ width: '100%' }}
        >
          {currentSlide === slides.length - 1 ? 'Get started' : 'Continue'}
        </Button>
      </div>
    </div>
  );
}
