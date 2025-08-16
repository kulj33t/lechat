const UserSkeleton = () => {
  const skeletonUsers = Array(12).fill(null);

  return (
    <div className="mt-16 grid grid-cols-2 sm:grid-cols-3  md:grid-cols-4 gap-x-16 sm:gap-x-24  md:gap-x-40 gap-y-20 p-4 overflow-auto scorllbar-hidden">
      {skeletonUsers.map((_, idx) => (
        <div key={idx} className="flex flex-col items-center gap-10">
          <div className="w-16 h-16 rounded-full skeleton" />
          <div className="skeleton h-4 w-24" />
        </div>
      ))}
    </div>
  );
};

const GroupSkeleton = () => {
  const skeletonGroups = Array(12).fill(null);

  return (
    <div className="mt-16 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-16 sm:gap-x-24 md:gap-x-30 gap-y-20 p-4 overflow-x-auto scorllbar-hidden">
      {skeletonGroups.map((_, idx) => (
        <div
          key={idx}
          className="p-4 border rounded-lg shadow-sm space-y-4 gap-10 w-full max-w-[400px]"
        >
          <div className="size-16 rounded-full skeleton mx-auto" />
          <div className="skeleton h-4 w-auto mx-auto" />
          <div className="skeleton h-3 w-auto mx-auto" />
        </div>
      ))}
    </div>
  );
};

export { UserSkeleton, GroupSkeleton };
