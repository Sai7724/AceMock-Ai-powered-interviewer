

export type AvatarGender = 'male' | 'female' | 'neutral';

interface AvatarProps {
  seed?: string;
  name?: string;
  size?: number | string;
  className?: string;
}

/**
 * Modern Initials-based Avatar.
 * Replaces complex characters with a clean, high-contrast initials view.
 */

const BgColors = [
  'from-blue-600 to-indigo-700',
  'from-purple-600 to-pink-700',
  'from-emerald-600 to-teal-700',
  'from-amber-600 to-orange-700',
  'from-rose-600 to-red-700',
  'from-cyan-600 to-blue-700'
];

export const MainAvatar = ({ seed, name, size = 120, className = "" }: AvatarProps) => {
  const getInitials = () => {
    if (!name && !seed) return 'AM';
    const text = name || seed || 'User';
    
    // If it's an email, take first two letters
    if (text.includes('@')) {
      return text.substring(0, 2).toUpperCase();
    }
    
    const parts = text.split(/\s+/).filter(p => p.length > 0);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return text.substring(0, 2).toUpperCase();
  };

  const initials = getInitials();
  const colorIndex = seed ? Math.abs(seed.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)) % BgColors.length : 0;
  const bgColor = BgColors[colorIndex];

  return (
    <div 
      className={`flex items-center justify-center rounded-full bg-gradient-to-br ${bgColor} text-white font-black select-none shadow-lg ${className}`}
      style={{ width: size, height: size, fontSize: typeof size === 'number' ? size * 0.4 : 'inherit' }}
    >
      {initials}
    </div>
  );
};

export default MainAvatar;
