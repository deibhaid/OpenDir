import { AppHeader } from './components/AppHeader';
import { FileBrowser } from './components/FileBrowser';
import { PreviewModal } from './components/PreviewModal';
import { OpenDirProvider } from './context/OpenDirContext';
import type { DirectoryItem } from './types';

function AppShell({ initialItems }: { initialItems: DirectoryItem[] }) {
  return (
    <OpenDirProvider initialItems={initialItems}>
      <div className="flex h-full flex-col">
        <AppHeader />
        <FileBrowser />
        <PreviewModal />
      </div>
    </OpenDirProvider>
  );
}

function App({ initialItems }: { initialItems: DirectoryItem[] }) {
  return <AppShell initialItems={initialItems} />;
}

export { App, AppShell };
