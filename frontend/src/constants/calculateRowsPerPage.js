export default function calculateRowsPerPage(tableContainerRef, tableRowRef, filteredCases, setRowsPerPage, setTotalPages, page, setPage) {
    if (tableContainerRef.current && tableRowRef.current) {
        const windowHeight = window.innerHeight;
        const tableTop = tableContainerRef.current.getBoundingClientRect().top;
        const availableHeight = windowHeight - tableTop - 150; // 100px на отступы и пагинацию

        const rowHeight = tableRowRef.current.getBoundingClientRect().height;
        const possibleRows = Math.floor(availableHeight / rowHeight);

        // Обновляем состояние
        setRowsPerPage(possibleRows > 0 ? possibleRows : 1);

        // Обновляем общее количество страниц
        const total = Math.ceil(filteredCases.length / (possibleRows || 1));
        setTotalPages(total);

        
            // Сбросить страницу, если текущая страница больше общего количества страниц
        if (page > total) {
            setPage(1);
        }
    }
};