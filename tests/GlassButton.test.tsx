import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import GlassButton from '../components/common/GlassButton';
import fs from 'fs';
import path from 'path';

describe('GlassButton CSS Classes - Task 3.3', () => {
  describe('Button CSS class application', () => {
    it('should apply liquid-button-primary class for primary variant', () => {
      const { container } = render(<GlassButton variant="primary">Click me</GlassButton>);
      const button = container.querySelector('.liquid-button-primary');
      expect(button).toBeTruthy();
    });

    it('should apply liquid-button-secondary class for secondary variant', () => {
      const { container } = render(<GlassButton variant="secondary">Click me</GlassButton>);
      const button = container.querySelector('.liquid-button-secondary');
      expect(button).toBeTruthy();
    });
  });

  describe('CSS token verification', () => {
    it('should have violet color tokens defined in index.css', () => {
      const cssPath = path.join(__dirname, '../index.css');
      const cssContent = fs.readFileSync(cssPath, 'utf-8');
      
      expect(cssContent).toContain('--accent-violet: #A78BFA');
      expect(cssContent).toContain('--accent-violet-light: #C4B5FD');
    });

    it('should have blue color tokens defined in index.css', () => {
      const cssPath = path.join(__dirname, '../index.css');
      const cssContent = fs.readFileSync(cssPath, 'utf-8');
      
      expect(cssContent).toContain('--accent-blue: #7FB5FF');
      expect(cssContent).toContain('--accent-blue-light: #B3D6FF');
    });
  });

  describe('Button CSS properties verification - Requirements 5.1-5.6', () => {
    it('should have primary button with violet gradient (Req 5.1)', () => {
      const cssPath = path.join(__dirname, '../index.css');
      const cssContent = fs.readFileSync(cssPath, 'utf-8');
      
      // Check for violet gradient in primary button
      expect(cssContent).toMatch(/\.liquid-button-primary\s*{[^}]*background:\s*linear-gradient\(135deg,\s*var\(--accent-violet\),\s*var\(--accent-violet-light\)\)/s);
      expect(cssContent).toMatch(/\.liquid-button-primary\s*{[^}]*color:\s*#1a1a1a/s);
    });

    it('should have secondary button with blue border and glass background (Req 5.2)', () => {
      const cssPath = path.join(__dirname, '../index.css');
      const cssContent = fs.readFileSync(cssPath, 'utf-8');
      
      // Check for glass background and blue border
      expect(cssContent).toMatch(/\.liquid-button-secondary\s*{[^}]*background-color:\s*rgba\(255,\s*255,\s*255,\s*0\.05\)/s);
      expect(cssContent).toMatch(/\.liquid-button-secondary\s*{[^}]*border:\s*1px\s+solid\s+rgba\(127,\s*181,\s*255,\s*0\.4\)/s);
    });

    it('should have hover states with translateY(-2px) (Req 5.3)', () => {
      const cssPath = path.join(__dirname, '../index.css');
      const cssContent = fs.readFileSync(cssPath, 'utf-8');
      
      // Check hover states
      expect(cssContent).toMatch(/\.liquid-button-primary:hover\s*{[^}]*transform:\s*translateY\(-2px\)/s);
      expect(cssContent).toMatch(/\.liquid-button-secondary:hover\s*{[^}]*transform:\s*translateY\(-2px\)/s);
    });

    it('should have active states with scale(0.97) (Req 5.4)', () => {
      const cssPath = path.join(__dirname, '../index.css');
      const cssContent = fs.readFileSync(cssPath, 'utf-8');
      
      // Check active states
      expect(cssContent).toMatch(/\.liquid-button-primary:active\s*{[^}]*transform:\s*scale\(0\.97\)/s);
      expect(cssContent).toMatch(/\.liquid-button-secondary:active\s*{[^}]*transform:\s*scale\(0\.97\)/s);
    });

    it('should have min-height and min-width of 44px (Req 5.5)', () => {
      const cssPath = path.join(__dirname, '../index.css');
      const cssContent = fs.readFileSync(cssPath, 'utf-8');
      
      // Check minimum touch target size
      expect(cssContent).toMatch(/\.liquid-button-primary\s*{[^}]*min-height:\s*44px/s);
      expect(cssContent).toMatch(/\.liquid-button-primary\s*{[^}]*min-width:\s*44px/s);
      expect(cssContent).toMatch(/\.liquid-button-secondary\s*{[^}]*min-height:\s*44px/s);
      expect(cssContent).toMatch(/\.liquid-button-secondary\s*{[^}]*min-width:\s*44px/s);
    });

    it('should have proper padding (Req 5.6)', () => {
      const cssPath = path.join(__dirname, '../index.css');
      const cssContent = fs.readFileSync(cssPath, 'utf-8');
      
      // Check padding
      expect(cssContent).toMatch(/\.liquid-button-primary\s*{[^}]*padding:\s*0\.75rem\s+1\.5rem/s);
      expect(cssContent).toMatch(/\.liquid-button-secondary\s*{[^}]*padding:\s*0\.75rem\s+1\.5rem/s);
    });

    it('should have transition timing for hover states (Req 5.3)', () => {
      const cssPath = path.join(__dirname, '../index.css');
      const cssContent = fs.readFileSync(cssPath, 'utf-8');
      
      // Check transition timing (150ms for hover)
      expect(cssContent).toMatch(/\.liquid-button-primary\s*{[^}]*transition:\s*transform\s+150ms\s+ease,\s*box-shadow\s+150ms\s+ease/s);
      expect(cssContent).toMatch(/\.liquid-button-secondary\s*{[^}]*transition:\s*transform\s+150ms\s+ease,\s*background-color\s+150ms\s+ease/s);
    });

    it('should have transition timing for active states (Req 5.4)', () => {
      const cssPath = path.join(__dirname, '../index.css');
      const cssContent = fs.readFileSync(cssPath, 'utf-8');
      
      // Check transition timing (100ms for active)
      expect(cssContent).toMatch(/\.liquid-button-primary:active\s*{[^}]*transition-duration:\s*100ms/s);
      expect(cssContent).toMatch(/\.liquid-button-secondary:active\s*{[^}]*transition-duration:\s*100ms/s);
    });
  });
});
