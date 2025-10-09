import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Image, Video, Share2, Download, Calendar, User, GraduationCap, Briefcase, CheckCircle, X } from 'lucide-react';
import Footer from '../components/Footer';
import { useBrandingStore } from '../stores/useBrandingStore';
import { useSessionStore } from '../stores/useSessionStore';
import { generatedImageBaseUrl, videoBaseUrl } from '../constants/appConstants';
import { GeneratedItem } from '../types/generatedItemTypes';

const GeneratedContent: React.FC = () => {
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [isPosting, setIsPosting] = useState(false);
  const [filter, setFilter] = useState<'all' | 'posted' | 'unposted'>('all');
  const [viewingItem, setViewingItem] = useState<GeneratedItem | null>(null);

  // Use store for state management
  const { allSessions, isLoadingSessions, loadAllSessions } = useSessionStore();
  const { settings, isLoading: isLoadingSettings, loadSettings } = useBrandingStore();


  // Map sessions to UI format
  const items: GeneratedItem[] = allSessions
    .filter(session => ['ready', 'published', 'active'].includes(session.status)) // include 'active'
    .map(session => ({
      id: session.id,
      studentName: session.studentName,
      studentClass: session.studentClass,
      profession: session.profession,
      futureImageUrl: session.futureImageId
        ? `${generatedImageBaseUrl}${session.futureImageId}`
        : `${generatedImageBaseUrl}${session.studentImageId}`,
      finalVideoUrl: session.outputs?.videoUrl ? `${videoBaseUrl}${session.outputs.videoUrl}` : undefined,
      createdAt: new Date(session.createdAt),
      isPosted: session.status === 'published',
    }));

  useEffect(() => {
    if (!settings && !isLoadingSettings) {
      loadSettings();
    }
  }, [settings, isLoadingSettings, loadSettings]);

  useEffect(() => {
    if (!settings?.id) return;

    loadAllSessions(settings.id);
  }, [settings?.id, loadAllSessions]);



  const filteredItems = items.filter(item => {
    if (filter === 'posted') return item.isPosted;
    if (filter === 'unposted') return !item.isPosted;
    return true;
  });

  const handleSelectItem = (id: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedItems(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedItems.size === filteredItems.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(filteredItems.map(item => item.id)));
    }
  };

  const handlePost = async () => {
    if (selectedItems.size === 0) return;

    setIsPosting(true);

    // Simulate posting delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Update posted status in the store
    // Note: This would need a proper updateSessionStatus method in the store
    // For now, we'll just simulate the update locally

    setSelectedItems(new Set());
    setIsPosting(false);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (isLoadingSessions) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-l-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading generated content...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 pb-16">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Link
                to="/teacher"
                className="flex items-center px-3 py-2 text-gray-600 hover:text-gray-800 rounded-lg transition duration-200 mr-4"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                <span className="text-sm font-medium">Back</span>
              </Link>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Generated Content</h1>
                <p className="text-sm text-gray-600">Manage and share student future images</p>
              </div>
            </div>

            {/* Post Selected Button */}
            {selectedItems.size > 0 && (
              <button
                onClick={handlePost}
                disabled={isPosting}
                className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition duration-200"
              >
                {isPosting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-l-transparent rounded-full animate-spin mr-2"></div>
                    Posting...
                  </>
                ) : (
                  <>
                    <Share2 className="w-4 h-4 mr-2" />
                    Post Selected ({selectedItems.size})
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* Filters and Controls */}
        <div className="bg-white p-4 rounded-lg shadow-md mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition duration-200 ${filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                >
                  All ({items.length})
                </button>
                <button
                  onClick={() => setFilter('unposted')}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition duration-200 ${filter === 'unposted' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                >
                  Unposted ({items.filter(item => !item.isPosted).length})
                </button>
                <button
                  onClick={() => setFilter('posted')}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition duration-200 ${filter === 'posted' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                >
                  Posted ({items.filter(item => item.isPosted).length})
                </button>
              </div>
            </div>

            {filteredItems.length > 0 && (
              <button
                onClick={handleSelectAll}
                className="flex items-center px-3 py-1 text-sm text-gray-600 hover:text-gray-800 transition duration-200"
              >
                {selectedItems.size === filteredItems.length ? 'Deselect All' : 'Select All'}
              </button>
            )}
          </div>
        </div>

        {/* Content Grid */}
        {filteredItems.length === 0 ? (
          <div className="bg-white p-8 rounded-lg shadow-md text-center">
            <Image className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Content Found</h3>
            <p className="text-gray-600">
              {filter === 'all'
                ? 'No generated content available yet.'
                : `No ${filter} content found.`
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className={`bg-white rounded-lg shadow-md overflow-hidden transition-all duration-200 ${selectedItems.has(item.id) ? 'ring-2 ring-blue-500' : 'hover:shadow-lg'
                  }`}
              >
                {/* Selection Checkbox */}
                <div className="relative">
                  <img
                    src={item.futureImageUrl}
                    alt={`Future ${item.profession}`}
                    className="w-full h-48 object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS4zYIcFuWWsfSvBJdujgD_4dq6Sg6cPUHi3tVx3C9Vp1inuOLdpurfXeY&s';  //only apple
                    }}
                  />
                  <button
                    onClick={() => handleSelectItem(item.id)}
                    className={`absolute top-2 right-2 w-6 h-6 rounded-full border-2 flex items-center justify-center transition duration-200 ${selectedItems.has(item.id)
                        ? 'bg-blue-600 border-blue-600 text-white'
                        : 'bg-white border-gray-300 hover:border-blue-500'
                      }`}
                  >
                    {selectedItems.has(item.id) && <CheckCircle className="w-4 h-4" />}
                  </button>

                  {/* Posted Badge */}
                  {item.isPosted && (
                    <div className="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                      Posted
                    </div>
                  )}

                  {/* Media Type Indicators */}
                  <div className="absolute bottom-2 left-2 flex space-x-1">
                    <div className="bg-black/50 backdrop-blur-sm rounded-full p-1">
                      <Image className="w-4 h-4 text-white" />
                    </div>
                    {item.finalVideoUrl && (
                      <div className="bg-black/50 backdrop-blur-sm rounded-full p-1">
                        <Video className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Content Info */}
                <div className="p-4">
                  <div className="flex items-center mb-2">
                    <User className="w-4 h-4 text-gray-500 mr-1" />
                    <h3 className="font-semibold text-gray-900">{item.studentName}</h3>
                  </div>

                  <div className="flex items-center text-sm text-gray-600 mb-1">
                    <GraduationCap className="w-3 h-3 mr-1" />
                    <span>{item.studentClass}</span>
                  </div>

                  <div className="flex items-center text-sm text-gray-600 mb-2">
                    <Briefcase className="w-3 h-3 mr-1" />
                    <span>Future {item.profession}</span>
                  </div>

                  <div className="flex items-center text-xs text-gray-500">
                    <Calendar className="w-3 h-3 mr-1" />
                    <span>{formatDate(item.createdAt)}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="px-4 pb-4 flex space-x-2">
                  {item.finalVideoUrl && (
                    <button
                      onClick={() => setViewingItem(item)}
                      className="flex-1 flex items-center justify-center px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition duration-200 text-sm"
                    >
                      <Video className="w-4 h-4 mr-1" />
                      View
                    </button>
                  )}
                  <button className="flex-1 flex items-center justify-center px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition duration-200 text-sm">
                    <Download className="w-4 h-4 mr-1" />
                    Download
                  </button>
                  {!item.isPosted && (
                    <button
                      onClick={() => {
                        setSelectedItems(new Set([item.id]));
                        handlePost();
                      }}
                      className="flex-1 flex items-center justify-center px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition duration-200 text-sm"
                    >
                      <Share2 className="w-4 h-4 mr-1" />
                      Post
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Video Modal */}
      {viewingItem && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <div>
                <h2 className="text-xl font-bold text-gray-900">{viewingItem.studentName}</h2>
                <p className="text-sm text-gray-600">
                  {viewingItem.studentClass} - Future {viewingItem.profession}
                </p>
              </div>
              <button
                onClick={() => setViewingItem(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition duration-200"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-4">
              {/* Image */}
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Generated Image</h3>
                <img
                  src={viewingItem.futureImageUrl}
                  alt={`Future ${viewingItem.profession}`}
                  className="w-full rounded-lg"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS4zYIcFuWWsfSvBJdujgD_4dq6Sg6cPUHi3tVx3C9Vp1inuOLdpurfXeY&s';
                  }}
                />
              </div>

              {/* Video */}
              {viewingItem.finalVideoUrl && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Generated Video</h3>
                  <video
                    src={viewingItem.finalVideoUrl}
                    controls
                    className="w-full rounded-lg"
                    controlsList="nodownload"
                  >
                    Your browser does not support the video tag.
                  </video>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end space-x-2 p-4 border-t">
              <button
                onClick={() => setViewingItem(null)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition duration-200"
              >
                Close
              </button>
              <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition duration-200 flex items-center">
                <Download className="w-4 h-4 mr-2" />
                Download All
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default GeneratedContent;