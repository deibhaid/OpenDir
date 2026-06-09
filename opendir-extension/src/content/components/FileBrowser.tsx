import InfiniteScroll from 'react-infinite-scroll-component';
import { useOpenDir } from '../context/OpenDirContext';
import { EmptyState, GridSkeletonCards, ListSkeletonRows } from './EmptyState';
import { GridParentCard, GridViewContent } from './GridView';
import { ListViewBody, ListViewHeader, ListViewParentRow } from './ListView';

export function FileBrowser() {
  const {
    view,
    visibleItems,
    filteredSortedItems,
    hasMore,
    loadMore,
    footerText,
    items,
    pinParentDirectory,
  } = useOpenDir();

  const hasParsedItems = items.length > 0;

  if (!hasParsedItems || filteredSortedItems.length === 0) {
    return <EmptyState />;
  }

  if (view === 'grid') {
    return (
      <div className="flex min-h-0 flex-1 flex-col">
        {pinParentDirectory ? <GridParentCard /> : null}
        <div id="scrollableDiv" className="min-h-0 flex-1 overflow-y-auto">
          <InfiniteScroll
            dataLength={visibleItems.length}
            next={loadMore}
            hasMore={hasMore}
            loader={<GridSkeletonCards />}
            scrollableTarget="scrollableDiv"
          >
            <GridViewContent omitParent={pinParentDirectory} />
          </InfiniteScroll>
          <div className="py-8 text-center text-sm text-muted-foreground">{footerText}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <ListViewHeader />
      {pinParentDirectory ? <ListViewParentRow /> : null}
      <div id="scrollableDiv" className="min-h-0 flex-1 overflow-y-auto px-1">
        <InfiniteScroll
          dataLength={visibleItems.length}
          next={loadMore}
          hasMore={hasMore}
          loader={<ListSkeletonRows />}
          scrollableTarget="scrollableDiv"
        >
          <ListViewBody omitParent={pinParentDirectory} />
        </InfiniteScroll>
        <div className="py-8 text-center text-sm text-muted-foreground">{footerText}</div>
      </div>
    </div>
  );
}
