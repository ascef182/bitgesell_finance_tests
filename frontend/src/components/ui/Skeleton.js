import React from "react";

const Skeleton = ({
  className = "",
  variant = "rectangular",
  width,
  height,
  ...props
}) => {
  const baseClasses = "animate-pulse bg-gray-200 rounded";

  const variants = {
    rectangular: "rounded",
    circular: "rounded-full",
    text: "rounded h-4",
    title: "rounded h-6",
    avatar: "rounded-full w-10 h-10",
  };

  const classes = `${baseClasses} ${variants[variant]} ${className}`;

  const style = {
    width: width,
    height: height,
  };

  return <div className={classes} style={style} {...props} />;
};

// Predefined skeleton components
const SkeletonCard = () => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
    <div className="p-6">
      <Skeleton variant="text" className="w-3/4 mb-2" />
      <Skeleton variant="title" className="w-1/2 mb-4" />
      <Skeleton variant="text" className="w-full mb-2" />
      <Skeleton variant="text" className="w-2/3 mb-4" />
      <div className="flex justify-between items-center">
        <Skeleton variant="text" className="w-20" />
        <Skeleton variant="rectangular" className="w-24 h-8" />
      </div>
    </div>
  </div>
);

const SkeletonList = ({ count = 6 }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {Array.from({ length: count }).map((_, index) => (
      <SkeletonCard key={index} />
    ))}
  </div>
);

Skeleton.Card = SkeletonCard;
Skeleton.List = SkeletonList;

export default Skeleton;
