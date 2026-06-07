import { Header } from './components/Header';
import { SelectionBar } from './components/SelectionBar';
import { ListView } from './components/ListView';
import { GridView } from './components/GridView';
import { PreviewModal } from './components/PreviewModal';
import { OpenDirProvider, useOpenDir } from './context/OpenDirContext';
import type { DirectoryItem } from './types';

function MainContent() {
  const { view } = useOpenDir();
  return view === 'grid' ? <GridView /> : <ListView />;
}

function App({ initialItems }: { initialItems: DirectoryItem[] }) {
  return (
    <OpenDirProvider initialItems={initialItems}>
      <div className="flex h-screen flex-col overflow-hidden">
        <Header />
        <SelectionBar />
        <main className="flex min-h-0 flex-1 flex-col">
          <MainContent />
        </main>
        <PreviewModal />
      </div>
    </OpenDirProvider>
  );
}

export { App };
