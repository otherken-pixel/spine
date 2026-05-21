import { useState } from 'react';
import { Bookshelf } from './components/Bookshelf/Bookshelf';
import { BookDetail } from './components/BookDetail/BookDetail';
import { ThemeSelector } from './components/ThemeSelector/ThemeSelector';
import { AddBookModal } from './components/AddBook/AddBookModal';
import { useTheme } from './hooks/useTheme';

export default function App() {
  useTheme();

  const [isThemeOpen, setIsThemeOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);

  return (
    <>
      <Bookshelf
        onOpenTheme={() => setIsThemeOpen(true)}
        onOpenAdd={() => setIsAddOpen(true)}
      />
      <BookDetail />
      <ThemeSelector isOpen={isThemeOpen} onClose={() => setIsThemeOpen(false)} />
      <AddBookModal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} />
    </>
  );
}
