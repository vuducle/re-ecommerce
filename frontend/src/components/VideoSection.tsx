import React from 'react';

const VideoSection: React.FC = () => {
  return (
    <section className="py-12 dark:bg-gray-800">
      <div className="container mx-auto text-white px-4">
        <h2 className="text-3xl font-bold text-center mb-4 dark:text-white">
          Got somethin' that might interest ya!
        </h2>
        <p className="text-lg text-center mb-8 dark:text-gray-300">
          Heh heh heh... Thank you!
        </p>
        <div className="relative aspect-video w-full max-w-4xl mx-auto rounded-lg shadow-lg overflow-hidden">
          <iframe
            src="https://www.youtube.com/embed/rcFarJACzx0"
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute top-0 left-0 w-full h-full"
          ></iframe>
        </div>
      </div>
    </section>
  );
};

export default VideoSection;
