import { EmptyState } from "@/components/ui/empty-state";

export default function NotFound() {
  return (
    <EmptyState
      title="That submission does not exist"
      description="The record may have been deleted or the link is no longer valid."
      actionHref="/submissions"
      actionLabel="Open submission history"
    />
  );
}
