import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function PersonDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <button 
        onClick={handleBack}
        className="flex items-center text-white mb-4"
      >
        <ArrowLeft className="mr-2" /> Geri Dön
      </button>
      
      <h1 className="text-2xl font-bold mb-4">Oyuncu ID: {id}</h1>
      <p>Bu sayfa geliştirme aşamasındadır.</p>
    </div>
  );
}
