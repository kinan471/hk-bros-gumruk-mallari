'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, Menu, X, User, Heart, Loader2, ChevronRight } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Category, Product } from '@/types/database';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Header() {
  const router = useRouter();
  const supabase = createClient();

  const [categories, setCategories] = useState<Category[]>([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const [mobileSearchQuery, setMobileSearchQuery] = useState('');
  const [mobileSearchResults, setMobileSearchResults] = useState<Product[]>([]);
  const [mobileIsSearching, setMobileIsSearching] = useState(false);
  const [mobileIsDropdownOpen, setMobileIsDropdownOpen] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const mobileSearchInputRef = useRef<HTMLInputElement>(null);
  const mobileDropdownRef = useRef<HTMLDivElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const mobileDebounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      const { data } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('display_order');
      if (data) setCategories(data);
    };
    fetchCategories();

    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [supabase]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        searchInputRef.current &&
        !searchInputRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
      if (
        mobileDropdownRef.current &&
        !mobileDropdownRef.current.contains(event.target as Node) &&
        mobileSearchInputRef.current &&
        !mobileSearchInputRef.current.contains(event.target as Node)
      ) {
        setMobileIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const performSearch = useCallback(async (query: string, isMobile: boolean = false) => {
    if (!query.trim()) {
      if (isMobile) {
        setMobileSearchResults([]);
        setMobileIsDropdownOpen(false);
      } else {
        setSearchResults([]);
        setIsDropdownOpen(false);
      }
      return;
    }

    if (isMobile) setMobileIsSearching(true);
    else setIsSearching(true);
    setSelectedIndex(-1);

    try {
      const searchTerm = `%${query.trim()}%`;
      const { data, error } = await supabase
        .from('products')
        .select('*, categories(name, slug)')
        .or(
          `name.ilike.${searchTerm},` +
          `short_description.ilike.${searchTerm},` +
          `description.ilike.${searchTerm},` +
          `brand.ilike.${searchTerm}`
        )
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(6);

      if (error) throw error;

      let filteredResults = data || [];
      if (query.trim().length > 0) {
        const lowerQuery = query.toLowerCase();
        const tagMatches = filteredResults.filter(
          (p: any) => p.tags?.some((tag: string) => tag.toLowerCase().includes(lowerQuery))
        );
        const existingIds = new Set(filteredResults.map((p: any) => p.id));
        tagMatches.forEach((p: any) => {
          if (!existingIds.has(p.id)) {
            filteredResults.push(p);
            existingIds.add(p.id);
          }
        });
      }

      const finalResults = filteredResults.slice(0, 6);
      if (isMobile) {
        setMobileSearchResults(finalResults);
        setMobileIsDropdownOpen(true);
      } else {
        setSearchResults(finalResults);
        setIsDropdownOpen(true);
      }
    } catch (error) {
      console.error('Search error:', error);
      if (isMobile) setMobileSearchResults([]);
      else setSearchResults([]);
    } finally {
      if (isMobile) setMobileIsSearching(false);
      else setIsSearching(false);
    }
  }, [supabase]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);

    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);

    if (value.trim().length === 0) {
      setSearchResults([]);
      setIsDropdownOpen(false);
      return;
    }

    debounceTimerRef.current = setTimeout(() => performSearch(value, false), 300);
  };

  const handleMobileSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setMobileSearchQuery(value);

    if (mobileDebounceTimerRef.current) clearTimeout(mobileDebounceTimerRef.current);

    if (value.trim().length === 0) {
      setMobileSearchResults([]);
      setMobileIsDropdownOpen(false);
      return;
    }

    mobileDebounceTimerRef.current = setTimeout(() => performSearch(value, true), 300);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isDropdownOpen || searchResults.length === 0) {
      if (e.key === 'Enter' && searchQuery.trim()) {
        e.preventDefault();
        router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
        setIsDropdownOpen(false);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev < searchResults.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : searchResults.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && searchResults[selectedIndex]) {
        router.push(`/products/${searchResults[selectedIndex].slug}`);
        setSearchQuery('');
        setIsDropdownOpen(false);
      } else if (searchQuery.trim()) {
        router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
        setIsDropdownOpen(false);
      }
    } else if (e.key === 'Escape') {
      setIsDropdownOpen(false);
      searchInputRef.current?.blur();
    }
  };

  const highlightMatch = (text: string, query: string) => {
    if (!query.trim()) return text;
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, i) =>
      regex.test(part) ? (
        <mark key={i} className="bg-[#E8B04B]/30 text-[#1E3A5F] font-semibold rounded px-0.5">
          {part}
        </mark>
      ) : (
        <span key={i}>{part}</span>
      )
    );
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsDropdownOpen(false);
    }
  };

  const handleMobileSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mobileSearchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(mobileSearchQuery.trim())}`);
      setMobileIsDropdownOpen(false);
    }
  };

  const ProductResultItem = ({ product, index, isMobile = false }: { product: Product; index: number; isMobile?: boolean }) => (
    <Link
      href={`/products/${product.slug}`}
      onClick={() => {
        if (isMobile) {
          setMobileSearchQuery('');
          setMobileIsDropdownOpen(false);
        } else {
          setSearchQuery('');
          setIsDropdownOpen(false);
        }
      }}
      className={`flex items-center gap-3 sm:gap-4 px-3 sm:px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0 ${
        !isMobile && index === selectedIndex ? 'bg-[#1E3A5F]/5 border-l-4 border-l-[#1E3A5F]' : ''
      }`}
    >
      <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
        {product.main_image ? (
          <img src={product.main_image} alt={product.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Search className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400" />
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-gray-900 text-xs sm:text-sm truncate">
          {highlightMatch(product.name, isMobile ? mobileSearchQuery : searchQuery)}
        </h4>
        <div className="flex items-center gap-2 mt-1">
          {product.categories?.name && (
            <span className="text-[10px] sm:text-xs text-gray-500">{product.categories.name}</span>
          )}
          {product.brand && (
            <>
              <span className="text-gray-300">•</span>
              <span className="text-[10px] sm:text-xs text-gray-500">
                {highlightMatch(product.brand, isMobile ? mobileSearchQuery : searchQuery)}
              </span>
            </>
          )}
        </div>
      </div>

      <div className="text-right flex-shrink-0">
        {product.sale_price ? (
          <>
            <p className="font-bold text-[#1E3A5F] text-xs sm:text-sm">₺{product.sale_price}</p>
            <p className="text-[10px] sm:text-xs text-gray-400 line-through">₺{product.regular_price}</p>
          </>
        ) : (
          <p className="font-bold text-[#1E3A5F] text-xs sm:text-sm">{product.regular_price || '0'}</p>
        )}
      </div>
    </Link>
  );

  const parentCategories = categories.filter(cat => !cat.parent_id);

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${
      isScrolled ? 'bg-white shadow-md' : 'bg-white/95 backdrop-blur-sm'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
<Link href="/" className="flex items-center gap-3 group">
  <div className="relative w-11 h-11 sm:w-12 sm:h-12 bg-white rounded-lg shadow-md border border-gray-200 flex items-center justify-center overflow-hidden group-hover:shadow-lg transition-all duration-300 flex-shrink-0">
    <img 
      src="/1.jpg" 
      alt="HK BROS" 
      className="w-full h-full object-contain p-1"
    />
  </div>
  <div className="hidden sm:flex flex-col justify-center leading-tight">
    <img 
      src="/2.jpg" 
      alt="HK BROS" 
      className="h-5 w-auto object-contain"
    />
    <img 
      src="/3.jpg" 
      alt="GÜMRÜK MALLARI" 
      className="h-5 w-auto object-contain mt-0.5 opacity-70"
    />
  </div>
</Link>

          <div className="hidden md:flex flex-1 max-w-2xl mx-8 relative">
            <form onSubmit={handleSearchSubmit} className="relative w-full">
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Ürün ara... (örn: samsung, nike, telefon)"
                value={searchQuery}
                onChange={handleSearchChange}
                onKeyDown={handleKeyDown}
                onFocus={() => searchResults.length > 0 && setIsDropdownOpen(true)}
                className="w-full px-5 py-3 pr-12 rounded-full border-2 border-gray-200 focus:border-[#1E3A5F] focus:outline-none transition-all bg-gray-50 focus:bg-white"
                autoComplete="off"
              />
              <button
                type="submit"
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#1E3A5F] transition-colors"
              >
                {isSearching ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Search className="w-5 h-5" />
                )}
              </button>
            </form>

            {isDropdownOpen && (
              <div
                ref={dropdownRef}
                className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-50 max-h-[500px] overflow-y-auto"
              >
                {isSearching ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-[#1E3A5F]" />
                    <span className="ml-2 text-gray-600">Aranıyor...</span>
                  </div>
                ) : searchResults.length === 0 ? (
                  <div className="py-8 px-6 text-center">
                    <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-600 font-medium mb-1">Sonuç Bulunamadı</p>
                    <p className="text-sm text-gray-500">"{searchQuery}" için ürün bulunamadı</p>
                    <Link
                      href={`/search?q=${encodeURIComponent(searchQuery)}`}
                      className="inline-block mt-3 text-sm text-[#1E3A5F] hover:underline"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      Tüm sonuçları gör →
                    </Link>
                  </div>
                ) : (
                  <>
                    <div className="px-4 py-2 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                      <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Öneriler ({searchResults.length})
                      </span>
                      <span className="text-xs text-gray-400">↑↓ gezin • Enter seç • Esc kapat</span>
                    </div>
                    {searchResults.map((product, index) => (
                      <ProductResultItem key={product.id} product={product} index={index} />
                    ))}
                    <Link
                      href={`/search?q=${encodeURIComponent(searchQuery)}`}
                      onClick={() => setIsDropdownOpen(false)}
                      className="block px-4 py-3 bg-[#1E3A5F] text-white text-center text-sm font-semibold hover:bg-[#1A3354] transition-colors"
                    >
                      Tüm sonuçları gör →
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>

          <div className="hidden md:flex items-center gap-4">
            <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
              <Heart className="w-6 h-6 text-gray-600" />
            </button>
            <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
              <User className="w-6 h-6 text-gray-600" />
            </button>
          </div>

          <button
            className="md:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        <nav className="hidden md:block border-t border-gray-100 py-3">
          <ul className="flex items-center justify-center gap-6 lg:gap-8">
            <li>
              <Link href="/" className="text-sm font-medium text-gray-600 hover:text-[#1E3A5F] transition-colors">
                Ana Sayfa
              </Link>
            </li>
            {parentCategories.map((category) => {
              const hasChildren = categories.some(c => c.parent_id === category.id);
              return (
                <li key={category.id} className="relative group">
                  <Link
                    href={`/category/${category.slug}`}
                    className="text-sm font-medium text-gray-600 hover:text-[#1E3A5F] transition-colors flex items-center gap-1 py-2"
                  >
                    {category.name}
                    {hasChildren && (
                      <ChevronRight className="w-3 h-3 transition-transform group-hover:rotate-90" />
                    )}
                  </Link>
                  
                  {hasChildren && (
                    <div className="absolute top-full left-0 mt-1 w-64 bg-white rounded-lg shadow-xl border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                      <div className="py-2">
                        {categories
                          .filter(c => c.parent_id === category.id)
                          .map(subcat => (
                            <Link
                              key={subcat.id}
                              href={`/category/${subcat.slug}`}
                              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#1E3A5F] transition-colors"
                            >
                              {subcat.name}
                            </Link>
                          ))}
                      </div>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>
      </div>

      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100">
          <div className="max-w-7xl mx-auto px-4 py-4 space-y-4">
            <div className="relative">
              <form onSubmit={handleMobileSearchSubmit} className="relative">
                <input
                  ref={mobileSearchInputRef}
                  type="text"
                  placeholder="Ürün ara..."
                  value={mobileSearchQuery}
                  onChange={handleMobileSearchChange}
                  onFocus={() => mobileSearchResults.length > 0 && setMobileIsDropdownOpen(true)}
                  className="w-full px-4 py-3 pr-12 rounded-lg border-2 border-gray-200 focus:border-[#1E3A5F] focus:outline-none"
                  autoComplete="off"
                />
                <button type="submit" className="absolute right-4 top-1/2 -translate-y-1/2">
                  {mobileIsSearching ? (
                    <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                  ) : (
                    <Search className="w-5 h-5 text-gray-400" />
                  )}
                </button>
              </form>

              {mobileIsDropdownOpen && (
                <div
                  ref={mobileDropdownRef}
                  className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-50 max-h-[400px] overflow-y-auto"
                >
                  {mobileIsSearching ? (
                    <div className="flex items-center justify-center py-6">
                      <Loader2 className="w-5 h-5 animate-spin text-[#1E3A5F]" />
                      <span className="ml-2 text-sm text-gray-600">Aranıyor...</span>
                    </div>
                  ) : mobileSearchResults.length === 0 ? (
                    <div className="py-6 px-4 text-center">
                      <p className="text-sm text-gray-600">Sonuç bulunamadı</p>
                      <Link
                        href={`/search?q=${encodeURIComponent(mobileSearchQuery)}`}
                        className="inline-block mt-2 text-xs text-[#1E3A5F] hover:underline"
                        onClick={() => setMobileIsDropdownOpen(false)}
                      >
                        Tüm sonuçları gör →
                      </Link>
                    </div>
                  ) : (
                    <>
                      <div className="px-3 py-2 bg-gray-50 border-b border-gray-100">
                        <span className="text-xs font-semibold text-gray-600">
                          Öneriler ({mobileSearchResults.length})
                        </span>
                      </div>
                      {mobileSearchResults.map((product, index) => (
                        <ProductResultItem key={product.id} product={product} index={index} isMobile={true} />
                      ))}
                      <Link
                        href={`/search?q=${encodeURIComponent(mobileSearchQuery)}`}
                        onClick={() => setMobileIsDropdownOpen(false)}
                        className="block px-4 py-3 bg-[#1E3A5F] text-white text-center text-sm font-semibold hover:bg-[#1A3354] transition-colors"
                      >
                        Tüm sonuçları gör →
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>

            <nav>
              <ul className="space-y-1">
                <li>
                  <Link 
                    href="/" 
                    className="block py-2 px-3 text-gray-600 hover:text-[#1E3A5F] hover:bg-gray-50 rounded-lg transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Ana Sayfa
                  </Link>
                </li>
                {parentCategories.map((category) => {
                  const hasChildren = categories.some(c => c.parent_id === category.id);
                  const subcategories = categories.filter(c => c.parent_id === category.id);
                  
                  return (
                    <li key={category.id}>
                      <Link
                        href={`/category/${category.slug}`}
                        className="block py-2 px-3 text-gray-600 hover:text-[#1E3A5F] hover:bg-gray-50 rounded-lg transition-colors font-medium"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        {category.name}
                      </Link>
                      
                      {hasChildren && (
                        <ul className="ml-4 mt-1 space-y-1 border-l-2 border-gray-200 pl-3">
                          {subcategories.map(subcat => (
                            <li key={subcat.id}>
                              <Link
                                href={`/category/${subcat.slug}`}
                                className="block py-1.5 px-2 text-sm text-gray-500 hover:text-[#1E3A5F] hover:bg-gray-50 rounded transition-colors"
                                onClick={() => setIsMenuOpen(false)}
                              >
                                {subcat.name}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  );
                })}
              </ul>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}