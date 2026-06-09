import InfiniteScroll from 'react-infinite-scroll-component';
import { useOpenDir } from '../context/OpenDirContext';
import { EmptyState, GridSkeletonCards, ListSkeletonRows } from './EmptyState';
import { GridViewContent } from './GridView';
import { ListViewBody, ListViewHeader } from './ListView';

export function FileBrowser() {
  const {
    view,
    visibleItems,
    filteredSortedItems,
    hasMore,
    loadMore,
    footerText,
    items,
  } = useOpenDir();

  const hasParsedItems = items.length > 0;

  if (!hasParsedItems || filteredSortedItems.length === 0) {
    return <EmptyState />;
  }

  if (view === 'grid') {
    return (
      <div id="scrollableDiv" className="min-h-0 flex-1 overflow-y-auto">
        <InfiniteScroll
          dataLength={visibleItems.length}
          next={loadMore}
          hasMore={hasMore}
          loader={<GridSkeletonCards />}
          scrollableTarget="scrollableDiv"
        >
          <GridViewContent />
        </InfiniteScroll>
        <div className="py-8 text-center text-sm text-muted-foreground">{footerText}</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <ListViewHeader />
      <div id="scrollableDiv" className="min-h-0 flex-1 overflow-y-auto px-1">
        <InfiniteScroll
          dataLength={visibleItems.length}
          next={loadMore}
          hasMore={hasMore}
          loader={<ListSkeletonRows />}
          scrollableTarget="scrollableDiv"
        >
          <ListViewBody />
        </InfiniteScroll>
        <div className="py-8 text-center text-sm text-muted-foreground">{footerText}</div>
      </div>
    </div>
  );
}
