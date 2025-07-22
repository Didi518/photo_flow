'use client';

import axios from 'axios';
import Image from 'next/image';
import { toast } from 'sonner';
import { ImageIcon } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

import { BASE_API_URL } from '@/server';
import { addPost } from '@/store/postSlice';

import { Button } from '../ui/button';
import LoadingButton from '../helpers/LoadingButton';
import { handleAuthRequest } from '../utils/apiRequest';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

const CreatePostModal = ({ isOpen, onClose }: Props) => {
  const router = useRouter();
  const dispatch = useDispatch();
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [caption, setCaption] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setSelectedImage(null);
      setPreviewImage(null);
      setCaption('');
    }
  }, [isOpen]);

  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      if (!file.type.startsWith('image/')) {
        toast.error('Veuillez sélectionner un fichier image.');
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        toast.error("La taille de l'image ne doit pas dépasser 10 Mo.");
        return;
      }

      const imageUrl = URL.createObjectURL(file);
      setSelectedImage(file);
      setPreviewImage(imageUrl);
    }
  };

  const handleCreatePost = async () => {
    if (!selectedImage) {
      toast.error('Veuillez sélectionner une image.');
      return;
    }

    const formData = new FormData();
    formData.append('caption', caption);
    if (selectedImage) {
      formData.append('image', selectedImage);
    }

    const createPostReq = async () =>
      await axios.post(`${BASE_API_URL}/posts/create-post`, formData, {
        withCredentials: true,
      });

    const result = await handleAuthRequest(createPostReq, setIsLoading);
    if (result) {
      dispatch(addPost(result.data.data.post));
      toast.success(result.data.message || 'Post créé avec succès!');
      setPreviewImage(null);
      setCaption('');
      setSelectedImage(null);
      onClose();
      router.push('/');
      router.refresh();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        {previewImage ? (
          <div className="flex flex-col items-center justify-center text-center space-y-4">
            <div className="mt-4">
              <Image
                src={previewImage}
                alt="Image"
                width={400}
                height={400}
                className="overflow-auto max-h-96 rounded-md object-contain w-full"
              />
            </div>
            <input
              type="text"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Ecrire une description..."
              className="mt-4 p-2 border rounded-md w-full text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
            <div className="flex space-x-4 mt-4">
              <LoadingButton
                className="bg-blue-600 text-white hover:bg-blue-700"
                onClick={handleCreatePost}
                isLoading={isLoading}
                disabled={!selectedImage || !caption || isLoading}
              >
                Créer Post
              </LoadingButton>
              <Button
                className="bg-gray-500 text-white hover:bg-gray-600"
                onClick={() => {
                  setPreviewImage(null);
                  setSelectedImage(null);
                  setCaption('');
                  onClose();
                }}
              >
                Annuler
              </Button>
            </div>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="text-center mt-3 mb-3">
                Charger une Photo
              </DialogTitle>
            </DialogHeader>
            <div className="flex flex-col items-center justify-center text-center space-y-4">
              <div className="flex space-x-2 text-gray-600">
                <ImageIcon size={40} />
              </div>
              <p className="text-gray-600 mt-4">
                Choisir une image de votre appareil.
              </p>
              <Button
                className="bg-blue-600 text-white hover:bg-blue-700"
                onClick={handleButtonClick}
              >
                Fichier Image
              </Button>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                ref={fileInputRef}
                onChange={handleFileChange}
              />
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CreatePostModal;
