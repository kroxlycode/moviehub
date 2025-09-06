import React from 'react';
import { User } from 'lucide-react';
import { Person, getImageUrl } from '../services/tmdbApi';

interface PersonCardProps {
  person: Person;
  onClick: (person: Person) => void;
}

const PersonCard: React.FC<PersonCardProps> = ({ person, onClick }) => {
  const profileUrl = getImageUrl(person.profile_path, 'profile', 'medium');

  return (
    <div 
      className="bg-gray-800 rounded-lg overflow-hidden cursor-pointer group transition-all duration-300 hover:scale-105 hover:shadow-2xl"
      onClick={() => onClick(person)}
    >
      {/* Profile Image */}
      <div className="aspect-[2/3] relative overflow-hidden bg-gray-700">
        {person.profile_path ? (
          <img
            src={profileUrl}
            alt={person.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
            loading="lazy"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              target.nextElementSibling?.classList.remove('hidden');
            }}
          />
        ) : null}
        
        {/* Fallback Icon */}
        <div className={`${person.profile_path ? 'hidden' : 'flex'} absolute inset-0 items-center justify-center bg-gray-700`}>
          <User className="w-12 h-12 text-gray-500" />
        </div>

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Department Badge */}
        <div className="absolute top-2 left-2 bg-secondary/90 px-2 py-1 rounded text-dark text-xs font-semibold">
          {person.known_for_department}
        </div>
      </div>

      {/* Content */}
      <div className="p-3">
        <h3 className="text-white font-semibold text-sm mb-2 line-clamp-2 leading-tight">
          {person.name}
        </h3>
        
        {person.known_for && person.known_for.length > 0 && (
          <div className="text-gray-400 text-xs">
            <p className="line-clamp-2">
              Bilinen: {person.known_for.slice(0, 2).map(item => 
                'title' in item ? item.title : item.name
              ).join(', ')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PersonCard;
