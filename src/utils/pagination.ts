export interface Pagination<T> {
  data: T[];
  limit: number;
  pageNumber: number;
  firstPage:string;
  lastPage:string;
  totalPage:number;
  totalRecord:number;
  next: string;
  previous: string;
}
  
export default function paginate<T>(documents: T[], limit: number, pageNumber: number, totalRecord:number, path: string ): Pagination<T> {
  const totalPage = Math.ceil(totalRecord / limit);
  return {
    data: documents,
    limit,
    pageNumber,
    firstPage:totalPage > 0 ? `${process.env.BASE_URL}${path}?page=1&limit=${limit}` : '',
    lastPage:totalPage > 0 ? `${process.env.BASE_URL}${path}?page=${totalPage}&limit=${limit}` : '',
    totalPage:totalPage,
    totalRecord:totalRecord,
    next: documents.length < limit ? '' : `${process.env.BASE_URL}${path}?page=${pageNumber + 1}&limit=${limit}`,
    previous: (pageNumber > 1) ? `${process.env.BASE_URL}${path}?page=${pageNumber - 1}&limit=${limit}` : '',
  };
}