exports.getPagination = (page, size) => {
  const limit = size ? +size : 3;
  const offset = page ? page * limit : 0;
  return { limit, offset };
};

exports.getPaginationData = (data, page, limit) => {
  const { count: totalCount, rows: leads } = data;
  const currentPage = page ? +page : 0;
  const leadsCount = leads.length; // get count of returned leads
  const totalPages = Math.ceil(leadsCount / limit); // use leads count to calculate total pages
  return { totalCount: leadsCount, leads, totalPages, currentPage }; // return leadsCount instead of totalCount
};