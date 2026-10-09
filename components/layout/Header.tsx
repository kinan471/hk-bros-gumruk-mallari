'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Search,
  Menu,
  X,
  User,
  Heart,
  Loader2,
  ChevronRight,
  ChevronDown,
  ShoppingBag,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import type { Category, ProductCardProduct } from '@/types/database';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import CartIcon from '@/components/layout/CartIcon';
import { getCurrentProductPrice, isDiscountedPrice } from '@/lib/utils/pricing';

type NavigationCategory = Pick<Category, 'id' | 'name' | 'slug' | 'parent_id'>;
type SearchSuggestion = ProductCardProduct & {
  categories: { name: string; slug: string } | null;
};

export default function Header() {
  const router = useRouter();
  const [supabase] = useState(() => createClient());

  const [categories, setCategories] = useState<NavigationCategory[]>([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [expandedMobileCategory, setExpandedMobileCategory] = useState<string | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchSuggestion[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const [mobileSearchQuery, setMobileSearchQuery] = useState('');
  const [mobileSearchResults, setMobileSearchResults] = useState<SearchSuggestion[]>([]);
  const [mobileIsSearching, setMobileIsSearching] = useState(false);
  const [mobileIsDropdownOpen, setMobileIsDropdownOpen] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const mobileSearchInputRef = useRef<HTMLInputElement>(null);
  const mobileDropdownRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const mobileDebounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const searchRequestRef = useRef(0);
  const mobileSearchRequestRef = useRef(0);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data, error } = await supabase
          .from('categories')
          .select('id, name, slug, parent_id')
          .eq('is_active', true)
          .order('display_order');
        if (error) throw error;
        setCategories(data ?? []);
      } catch (error) {
        console.error('Kategori listesi yüklenemedi:', error);
      }
    };
    void fetchCategories();

    let scrollFrame = 0;
    const handleScroll = () => {
      if (scrollFrame) return;
      scrollFrame = window.requestAnimationFrame(() => {
        const nextIsScrolled = window.scrollY > 20;
        setIsScrolled((current) => current === nextIsScrolled ? current : nextIsScrolled);
        scrollFrame = 0;
      });
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollFrame) window.cancelAnimationFrame(scrollFrame);
    };
  }, [supabase]);

  useEffect(() => () => {
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    if (mobileDebounceTimerRef.current) clearTimeout(mobileDebounceTimerRef.current);
  }, []);

  useEffect(() => {
    if (!isMenuOpen) return;

    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsMenuOpen(false);
    };

    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [isMenuOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(target) &&
        searchInputRef.current &&
        !searchInputRef.current.contains(target)
      ) {
        setIsDropdownOpen(false);
      }

      if (
        mobileDropdownRef.current &&
        !mobileDropdownRef.current.contains(target) &&
        mobileSearchInputRef.current &&
        !mobileSearchInputRef.current.contains(target)
      ) {
        setMobileIsDropdownOpen(false);
      }

      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(target) &&
        menuButtonRef.current &&
        !menuButtonRef.current.contains(target)
      ) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const performSearch = useCallback(async (query: string, isMobile: boolean = false) => {
    const requestRef = isMobile ? mobileSearchRequestRef : searchRequestRef;
    const requestId = ++requestRef.current;

    if (!query.trim()) {
      if (isMobile) {
        setMobileSearchResults([]);
        setMobileIsDropdownOpen(false);
        setMobileIsSearching(false);
      } else {
        setSearchResults([]);
        setIsDropdownOpen(false);
        setIsSearching(false);
      }
      return;
    }
    if (query.trim().length < 2) {
      if (isMobile) {
        setMobileSearchResults([]);
        setMobileIsDropdownOpen(false);
        setMobileIsSearching(false);
      } else {
        setSearchResults([]);
        setIsDropdownOpen(false);
        setIsSearching(false);
      }
      return;
    }

    if (isMobile) setMobileIsSearching(true);
    else setIsSearching(true);
    setSelectedIndex(-1);

    try {
      const response = await fetch(
        `/api/search?q=${encodeURIComponent(query.trim())}&mode=suggestions`
      );
      if (!response.ok) throw new Error(`Search request failed with status ${response.status}.`);
      const payload = await response.json() as { results: SearchSuggestion[] };
      if (requestId !== requestRef.current) return;

      if (isMobile) {
        setMobileSearchResults(payload.results);
        setMobileIsDropdownOpen(true);
      } else {
        setSearchResults(payload.results);
        setIsDropdownOpen(true);
      }
    } catch (error) {
      if (requestId === requestRef.current) {
        console.error('Arama hatası:', error);
        if (isMobile) setMobileSearchResults([]);
        else setSearchResults([]);
      }
    } finally {
      if (requestId === requestRef.current) {
        if (isMobile) setMobileIsSearching(false);
        else setIsSearching(false);
      }
    }
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    searchRequestRef.current += 1;
    setIsSearching(false);

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
    mobileSearchRequestRef.current += 1;
    setMobileIsSearching(false);

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

  const ProductResultItem = ({ product, index, isMobile = false }: { product: SearchSuggestion; index: number; isMobile?: boolean }) => (
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
          <Image src={product.main_image} alt={product.name} width={56} height={56} className="w-full h-full object-cover" />
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
        {isDiscountedPrice(product.regular_price, product.sale_price) ? (
          <>
            <p className="font-bold text-[#1E3A5F] text-xs sm:text-sm">₺{product.sale_price}</p>
            <p className="text-[10px] sm:text-xs text-gray-400 line-through">₺{product.regular_price}</p>
          </>
        ) : getCurrentProductPrice(product.regular_price, product.sale_price) !== null ? (
          <p className="font-bold text-[#1E3A5F] text-xs sm:text-sm">
            ₺{getCurrentProductPrice(product.regular_price, product.sale_price)}
          </p>
        ) : (
          <p className="text-xs text-gray-500">Fiyat bilgisi yok</p>
        )}
      </div>
    </Link>
  );

  const parentCategories = categories.filter(cat => !cat.parent_id);

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${
      isScrolled ? 'bg-white shadow-md' : 'bg-white'
    }`}>
      <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">

          <Link href="/" className="flex items-center gap-3 group flex-shrink-0">
            <div className="relative w-11 h-11 sm:w-12 sm:h-12 bg-white rounded-lg shadow-md border border-gray-200 flex items-center justify-center overflow-hidden group-hover:shadow-lg transition-all duration-300">
              <Image src="/logo.png" alt="HK BROS" fill sizes="48px" className="object-contain p-1" />
            </div>
            <div className="leading-tight">
              <p className="font-bold text-gray-900">HK BROS</p>
              <p className="text-[10px] text-gray-500">GÜMRÜK MALLARI</p>
            </div>
          </Link>

          <div className="hidden md:flex flex-1 max-w-xl relative">
            <form onSubmit={handleSearchSubmit} className="relative w-full">
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Ürün ara... (örn: samsung, nike, telefon)"
                value={searchQuery}
                onChange={handleSearchChange}
                onKeyDown={handleKeyDown}
                onFocus={() => searchResults.length > 0 && setIsDropdownOpen(true)}
                className="w-full rounded-md border border-gray-300 bg-white px-4 py-2.5 pr-14 text-sm transition focus:border-[#1E3A5F] focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/15"
                autoComplete="off"
              />
              <button
                type="submit"
                aria-label="Arama Yap"
                className="absolute right-0 top-0 flex h-full w-11 items-center justify-center rounded-r-md bg-[#f3c56b] text-[#243746] transition-colors hover:bg-[#ffd77d]"
              >
                {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
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
                    <p className="text-sm text-gray-500">&quot;{searchQuery}&quot; için ürün bulunamadı</p>
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

          <div className="hidden md:flex items-center gap-3 flex-shrink-0">
            <Link href="/favorilerim" aria-label="Favoriler" className="p-2 rounded-full hover:bg-gray-100 transition-colors">
              <Heart className="w-5 h-5 text-gray-600" />
            </Link>
            <CartIcon />
            <Link
              href="/siparis-takip"
              aria-label="Sipariş Takibi"
              title="Sipariş Takibi"
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <User className="w-5 h-5 text-gray-600" />
            </Link>
          </div>

          <button
            ref={menuButtonRef}
            aria-label="Menü"
            aria-expanded={isMenuOpen}
            aria-controls="mobile-navigation"
            className="md:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        <nav className="hidden border-t border-[#344a5a] bg-[#1b3446] px-4 py-2 md:block">
          <ul className="flex items-center gap-5 overflow-x-auto whitespace-nowrap [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:gap-7">
            {parentCategories.map((category) => {
              const hasChildren = categories.some(c => c.parent_id === category.id);
              return (
                <li key={category.id} className="relative group">
                  <Link
                    href={`/category/${category.slug}`}
                    className="flex items-center gap-1 py-1 text-sm font-medium text-white/90 transition-colors hover:text-[#f3c56b]"
                  >
                    {category.name}
                    {hasChildren && (
                      <ChevronRight className="w-3 h-3 transition-transform group-hover:rotate-90" />
                    )}
                  </Link>

                  {hasChildren && (
                    <div className="absolute left-0 top-full z-50 mt-1 w-64 rounded-lg border border-gray-100 bg-white opacity-0 shadow-xl invisible transition-all duration-200 group-hover:visible group-hover:opacity-100">
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
        <div className="fixed inset-0 z-[60] md:hidden">
          <button
            type="button"
            aria-label="Menüyü kapat"
            className="absolute inset-0 h-full w-full bg-slate-950/55 backdrop-blur-[2px]"
            onClick={() => setIsMenuOpen(false)}
          />
          <aside
            ref={mobileMenuRef}
            id="mobile-navigation"
            aria-label="Ana menü"
            className="absolute right-0 top-0 flex h-[100dvh] w-[min(88vw,390px)] flex-col bg-white shadow-2xl motion-safe:animate-[drawer-in_240ms_ease-out]"
          >
            <div className="flex items-center justify-between bg-[#1b3446] px-5 py-5 text-white">
              <div>
                <p className="text-xs font-medium text-white/70">HK BROS mağazasına</p>
                <h2 className="mt-1 text-lg font-bold">Hoş geldiniz</h2>
              </div>
              <button
                type="button"
                onClick={() => setIsMenuOpen(false)}
                aria-label="Menüyü kapat"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 transition hover:bg-white/20"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 space-y-5 overflow-y-auto px-4 py-5">
              <div className="relative">
              <form onSubmit={handleMobileSearchSubmit} className="relative">
                <input
                  ref={mobileSearchInputRef}
                  type="text"
                  placeholder="Ürün ara..."
                  value={mobileSearchQuery}
                  onChange={handleMobileSearchChange}
                  onFocus={() => mobileSearchResults.length > 0 && setMobileIsDropdownOpen(true)}
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 pr-12 text-sm outline-none transition focus:border-[#1e5362] focus:bg-white focus:ring-2 focus:ring-[#1e5362]/10"
                  autoComplete="off"
                />
                <button type="submit" aria-label="Arama Yap" className="absolute right-3 top-1/2 -translate-y-1/2">
                  {mobileIsSearching ? (
                    <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
                  ) : (
                    <Search className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </form>

              {mobileIsDropdownOpen && (
                <div
                  ref={mobileDropdownRef}
                  className="absolute left-0 right-0 top-full z-50 mt-2 max-h-[400px] overflow-y-auto rounded-xl border border-gray-100 bg-white shadow-2xl"
                >
                  {mobileIsSearching ? (
                    <div className="flex items-center justify-center py-6">
                      <Loader2 className="h-5 w-5 animate-spin text-[#1E3A5F]" />
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
                        className="block bg-[#1E3A5F] px-4 py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-[#1A3354]"
                      >
                        Tüm sonuçları gör →
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>

              <div className="grid grid-cols-2 gap-3">
                <Link
                  href="/favorilerim"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex min-h-20 flex-col justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-800 transition hover:border-[#9bbcb6] hover:bg-[#f6faf9]"
                >
                  <Heart className="h-5 w-5 text-[#39766e]" />
                  Favorilerim
                </Link>
                <Link
                  href="/cart"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex min-h-20 flex-col justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-800 transition hover:border-[#9bbcb6] hover:bg-[#f6faf9]"
                >
                  <ShoppingBag className="h-5 w-5 text-[#39766e]" />
                  Sepetim
                </Link>
                <Link
                  href="/siparis-takip"
                  onClick={() => setIsMenuOpen(false)}
                  className="col-span-2 flex items-center gap-3 rounded-xl bg-[#f2f5f6] px-4 py-3 text-sm font-semibold text-gray-800 transition hover:bg-[#e8eff0]"
                >
                  <User className="h-5 w-5 text-[#39766e]" />
                  Siparişlerim ve sipariş takibi
                  <ChevronRight className="ml-auto h-4 w-4 text-gray-400" />
                </Link>
              </div>

              <Link
                href="/products"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-3 rounded-xl bg-[#fff5df] px-4 py-3 text-sm font-bold text-[#795517] transition hover:bg-[#ffedc5]"
              >
                <ShoppingBag className="h-5 w-5" />
                Tüm ürünleri görüntüle
                <ChevronRight className="ml-auto h-4 w-4" />
              </Link>

              <nav aria-label="Kategoriler">
                <div className="mb-2 flex items-center justify-between px-1">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">Alışveriş kategorileri</h3>
                  <span className="text-xs text-gray-400">{parentCategories.length} kategori</span>
                </div>
                <ul className="divide-y divide-gray-100 rounded-xl border border-gray-100 bg-white">
                {parentCategories.map((category) => {
                  const hasChildren = categories.some(c => c.parent_id === category.id);
                  const subcategories = categories.filter(c => c.parent_id === category.id);
                  const isExpanded = expandedMobileCategory === category.id;

                  return (
                    <li key={category.id} className="px-3 py-1">
                      <div className="flex items-center">
                        <Link
                          href={`/category/${category.slug}`}
                          className="flex-1 py-3 text-sm font-medium text-gray-800 transition-colors hover:text-[#1e5362]"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          {category.name}
                        </Link>
                      {hasChildren && (
                        <button
                          type="button"
                          aria-label={`${category.name} alt kategorilerini ${isExpanded ? 'kapat' : 'aç'}`}
                          aria-expanded={isExpanded}
                          onClick={() => setExpandedMobileCategory(isExpanded ? null : category.id)}
                          className="flex h-10 w-10 items-center justify-center rounded-lg text-gray-500 transition hover:bg-gray-100"
                        >
                          <ChevronDown className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                        </button>
                      )}
                      </div>
                      {hasChildren && isExpanded && (
                        <ul className="mb-2 ml-2 space-y-1 border-l-2 border-[#dce8e5] pl-3">
                          {subcategories.map((subcategory) => (
                            <li key={subcategory.id}>
                              <Link
                                href={`/category/${subcategory.slug}`}
                                onClick={() => setIsMenuOpen(false)}
                                className="block rounded-md px-2 py-2 text-sm text-gray-600 transition hover:bg-[#f4f8f7] hover:text-[#1e5362]"
                              >
                                {subcategory.name}
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

            <div className="border-t border-gray-100 px-5 py-3 text-center text-xs text-gray-400">
              HK BROS GÜMRÜK MALLARI
            </div>
          </aside>
        </div>
      )}
    </header>
  );
}