type WorkspaceContentProps = {
  children: React.ReactNode;
};

export function WorkspaceContent({ children }: WorkspaceContentProps) {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
      {children}
    </div>
  );
}
