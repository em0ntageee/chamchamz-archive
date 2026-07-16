/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ExternalLink, Calendar, ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import { PROJECTS_DATA } from '../data';
import { ProjectItem } from '../types';

export default function ProjectPosts() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 6;

  // 1. Filter and Sort Projects: "bài cũ ở sau, bài mới update thì nảy lên đầu" (Sort by date descending)
  const sortedProjects = [...PROJECTS_DATA].sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  const filteredProjects = selectedCategory === 'all'
    ? sortedProjects
    : sortedProjects.filter(p => p.category === selectedCategory);

  // 2. Pagination Calculation
  const totalPages = Math.ceil(filteredProjects.length / itemsPerPage) || 1;
  // Ensure current page doesn't exceed total pages after filtering
  const activePage = Math.min(currentPage, totalPages);
  const indexOfLastItem = activePage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredProjects.slice(indexOfFirstItem, indexOfLastItem);

  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat);
    setCurrentPage(1); // Reset page to 1 on category switch
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      // Smooth scroll to top of projects section
      const element = document.getElementById('projects-section-header');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  const categories = [
    { id: 'all', label: 'Tất cả' },
    { id: 'gift support', label: '🎁 Gift Support' },
    { id: 'led', label: '🌟 LED' },
    { id: 'ads', label: '🚌 Ads' },
    { id: 'event', label: '🫧 Event' },
    { id: 'others', label: '✨ Others' }
  ];

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'gift support':
        return 'bg-pink-100 text-pink-700 border-pink-200';
      case 'led':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'ads':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'event':
        return 'bg-teal-100 text-teal-700 border-teal-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="mb-12 font-sans">
      {/* Header & Description */}
      <div id="projects-section-header" className="text-center mb-8 scroll-mt-24">
        <h3 className="text-xl md:text-2xl font-bold text-slate-800 flex items-center justify-center gap-2">
          <span>Projects for Chamchamz</span>
        </h3>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-center gap-2 mb-8 px-2">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => handleCategoryChange(cat.id)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold border cursor-pointer transition-all ${
              selectedCategory === cat.id
                ? 'bg-brand-teal-500 text-slate-900 border-brand-teal-600 shadow-xs scale-102 font-bold'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-800'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Main Grid and Empty State */}
      <div className="relative min-h-[400px]">
        {currentItems.length === 0 ? (
          <div className="text-center py-16 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            <Filter className="w-10 h-10 text-slate-400 mx-auto mb-3" />
            <p className="text-slate-500 text-sm font-semibold">Không tìm thấy bài viết nào thuộc chuyên mục này.</p>
          </div>
        ) : (
          <motion.div 
            layout
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            <AnimatePresence mode="popLayout">
              {currentItems.map((project, idx) => (
                <motion.a
                  key={project.id}
                  href={project.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  layout
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3, delay: idx * 0.05 }}
                  className="group flex flex-col bg-white rounded-2xl overflow-hidden border border-slate-100 hover:border-brand-teal-300 hover:shadow-md transition-all duration-300 relative"
                  id={`project-card-${project.id}`}
                >
                  {/* Card Thumbnail */}
                  <div className="aspect-video w-full overflow-hidden bg-slate-100 relative">
                    <img
                      src={project.imageFile || "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=600&q=80"}
                      alt={project.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                    
                    {/* Hover Effect Details */}
                    <div className="absolute inset-0 bg-slate-950/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="bg-white/90 text-slate-900 rounded-full p-2.5 shadow-sm transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                        <ExternalLink className="w-4 h-4" />
                      </div>
                    </div>

                    {/* Category Badge */}
                    <div className="absolute top-3 left-3">
                      <span className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-wider border shadow-xs ${getCategoryColor(project.category)}`}>
                        {project.category}
                      </span>
                    </div>
                  </div>

                  {/* Card Info */}
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      {/* Date */}
                      <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-bold mb-2">
                        <Calendar className="w-3 h-3" />
                        <span>{formatDate(project.date)}</span>
                      </div>

                      {/* Title */}
                      <h4 className="text-sm font-bold text-slate-800 line-clamp-2 leading-snug group-hover:text-brand-teal-600 transition-colors">
                        {project.title}
                      </h4>

                      {/* Caption */}
                      {project.caption && (
                        <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed font-semibold">
                          {project.caption}
                        </p>
                      )}
                    </div>

                    {/* View Details Prompt */}
                    <div className="mt-4 pt-3 border-t border-slate-50 flex items-center justify-between text-[11px] font-bold text-slate-400 group-hover:text-brand-teal-500 transition-colors">
                      <span>Xem link gốc</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </motion.a>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-10">
          <button
            onClick={() => handlePageChange(activePage - 1)}
            disabled={activePage === 1}
            className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:pointer-events-none cursor-pointer text-slate-600"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {Array.from({ length: totalPages }).map((_, pageIdx) => {
            const pageNum = pageIdx + 1;
            return (
              <button
                key={pageNum}
                onClick={() => handlePageChange(pageNum)}
                className={`w-9 h-9 rounded-xl border font-bold text-xs cursor-pointer transition-all ${
                  activePage === pageNum
                    ? 'bg-slate-900 border-slate-900 text-white shadow-xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {pageNum}
              </button>
            );
          })}

          <button
            onClick={() => handlePageChange(activePage + 1)}
            disabled={activePage === totalPages}
            className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:pointer-events-none cursor-pointer text-slate-600"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
