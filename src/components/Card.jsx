import React from 'react';

export default function Card({ title, author, date, category, imageUrl }) {
  return (
    <div className="rounded-xl overflow-hidden shadow-lg h-55 relative group">
      <div 
        className="absolute inset-0 bg-cover bg-center z-0 transition-transform duration-300 group-hover:scale-110"
        style={{ backgroundImage: `url(${imageUrl})` }}
      ></div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10"></div>
      <div className="absolute bottom-0 left-0 right-0 p-4 text-white z-20">
        <div className="flex justify-between items-center text-sm mb-2">
          <span className="opacity-80">{date}</span>
          <span className="opacity-80">{author}</span>
        </div>
        <h3 className="font-bold text-lg line-clamp-2">{title}</h3>
        <p className="opacity-80 text-xs">{category}</p>
      </div>
    </div>
  );
}
