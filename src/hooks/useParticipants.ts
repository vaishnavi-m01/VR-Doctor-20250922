import { useState, useEffect, useCallback } from 'react';
import { 
  participantService, 
  Participant, 
  ParticipantFilters, 
  ParticipantPaginationRequest,
  ParticipantPaginationResponse 
} from '../services/participantService';

interface UseParticipantsReturn {
  participants: Participant[];
  loading: boolean;
  error: string | null;
  total: number;
  currentPage: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  fetchParticipants: (filters?: ParticipantFilters) => Promise<void>;
  fetchParticipantsPagination: (request: ParticipantPaginationRequest) => Promise<void>;
  refreshParticipants: () => Promise<void>;
  clearError: () => void;
  goToPage: (page: number) => void;
  changePageSize: (newPageSize: number) => void;
}

export const useParticipants = (initialFilters?: ParticipantFilters): UseParticipantsReturn => {
  console.log('🎣 useParticipants: Hook initialized with filters:', initialFilters);
  
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [hasNextPage, setHasNextPage] = useState<boolean>(false);
  const [hasPreviousPage, setHasPreviousPage] = useState<boolean>(false);

  const fetchParticipantsPagination = useCallback(async (request: ParticipantPaginationRequest) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 Fetching participants with pagination:', request);
      const response = await participantService.getParticipantsPagination(request);
      
      console.log('✅ Participants pagination API response:', response);
      
      if (response.success) {
        const data = response.data as ParticipantPaginationResponse;
        setParticipants(data.participants);
        setTotal(data.totalCount);
        setCurrentPage(data.currentPage);
        setPageSize(data.pageSize);
        setTotalPages(data.totalPages);
        setHasNextPage(data.hasNextPage);
        setHasPreviousPage(data.hasPreviousPage);
        console.log(`📊 Loaded ${data.participants.length} participants (page ${data.currentPage} of ${data.totalPages})`);
      } else {
        setError(response.message || 'Failed to fetch participants');
        console.error('❌ Pagination API response error:', response.message);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while fetching participants';
      setError(errorMessage);
      console.error('💥 Error fetching participants with pagination:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchParticipants = useCallback(async (filters?: ParticipantFilters) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 Fetching participants with filters:', filters);
      const response = await participantService.getParticipants(filters || initialFilters);
      
      console.log('✅ Participants API response:', response);
      
      if (response.success) {
        setParticipants(response.data);
        setTotal(response.data.length);
        console.log(`📊 Loaded ${response.data.length} participants`);
      } else {
        setError(response.message || 'Failed to fetch participants');
        console.error('❌ API response error:', response.message);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while fetching participants';
      setError(errorMessage);
      console.error('💥 Error fetching participants:', err);
    } finally {
      setLoading(false);
    }
  }, [initialFilters]);

  const refreshParticipants = useCallback(async () => {
    // Use pagination by default for refresh
    await fetchParticipantsPagination({
      page: currentPage,
      pageSize,
      filters: initialFilters,
    });
  }, [fetchParticipantsPagination, currentPage, pageSize, initialFilters]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const goToPage = useCallback((page: number) => {
    if (page >= 1 && page <= totalPages) {
      fetchParticipantsPagination({
        page,
        pageSize,
        filters: initialFilters,
      });
    }
  }, [fetchParticipantsPagination, pageSize, initialFilters, totalPages]);

  const changePageSize = useCallback((newPageSize: number) => {
    setPageSize(newPageSize);
    fetchParticipantsPagination({
      page: 1, // Reset to first page when changing page size
      pageSize: newPageSize,
      filters: initialFilters,
    });
  }, [fetchParticipantsPagination, initialFilters]);

  // Initial fetch using pagination API
  useEffect(() => {
    console.log('🔄 useParticipants: useEffect triggered, calling fetchParticipantsPagination');
    
    const initialFetch = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('🔍 Initial fetch: Fetching participants with pagination...');
        console.log('🔍 Request params:', { page: 1, pageSize: 10, filters: initialFilters });
        
        const response = await participantService.getParticipantsPagination({
          page: 1,
          pageSize: 10,
          filters: initialFilters,
        });
        
        console.log('✅ Initial fetch response:', response);
        
        if (response.success) {
          const data = response.data as ParticipantPaginationResponse;
          console.log('📊 Parsed data:', data);
          
          setParticipants(data.participants);
          setTotal(data.totalCount);
          setCurrentPage(data.currentPage);
          setPageSize(data.pageSize);
          setTotalPages(data.totalPages);
          setHasNextPage(data.hasNextPage);
          setHasPreviousPage(data.hasPreviousPage);
          console.log(`📊 Initial fetch: Loaded ${data.participants.length} participants (page ${data.currentPage} of ${data.totalPages})`);
        } else {
          setError(response.message || 'Failed to fetch participants');
          console.error('❌ Initial fetch error:', response.message);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An error occurred while fetching participants';
        setError(errorMessage);
        console.error('💥 Initial fetch error:', err);
        console.error('💥 Error details:', {
          name: err instanceof Error ? err.name : 'Unknown',
          message: err instanceof Error ? err.message : 'Unknown error',
          stack: err instanceof Error ? err.stack : 'No stack trace'
        });
      } finally {
        setLoading(false);
      }
    };
    
    initialFetch();
  }, []); // Empty dependency array

  return {
    participants,
    loading,
    error,
    total,
    currentPage,
    pageSize,
    totalPages,
    hasNextPage,
    hasPreviousPage,
    fetchParticipants,
    fetchParticipantsPagination,
    refreshParticipants,
    clearError,
    goToPage,
    changePageSize,
  };
};

export default useParticipants;
