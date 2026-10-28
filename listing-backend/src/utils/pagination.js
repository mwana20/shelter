export const getPagination = (query, defaultLimit = 12, maxLimit = 100) => {
  const page = Math.max(1, parseInt(query.page || '1', 10));
  const limit = Math.min(maxLimit, Math.max(1, parseInt(query.limit || defaultLimit.toString(), 10)));
  const skip = (page - 1) * limit;

  return { page, limit, skip };
};

export const formatPaginationResponse = (data, totalItems, page, limit) => {
  const totalPages = Math.ceil(totalItems / limit);
  return {
    items: data,
    pagination: {
      currentPage: page,
      limit,
      totalItems,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1
    }
  };
};
