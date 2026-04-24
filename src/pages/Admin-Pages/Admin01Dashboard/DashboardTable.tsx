import DataTable from 'react-data-table-component';
import { Box } from '@mui/material';
import { DASHBOARD_CUTSOM_STYLE } from '../../../utils/DataTableColumnsProvider';

const DashboardTable = ({ data, columns, sx = {} }: { data: any, columns: any, sx?: any }) => {

    return (
        <Box sx={{ width: '100%', ...sx }}>
            <DataTable
                columns={columns}
                data={data}
                pagination
                highlightOnHover
                customStyles={DASHBOARD_CUTSOM_STYLE}
                pointerOnHover
                noDataComponent={<div>No data available</div>}
            />
        </Box>
    );
}

export default DashboardTable;
