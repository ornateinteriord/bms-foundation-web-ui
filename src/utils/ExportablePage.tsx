import React, { useMemo, useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Checkbox,
  FormControlLabel,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Collapse,
  IconButton,
} from '@mui/material';
import {
  ExpandLess,
  ExpandMore,
  Save,
  Refresh,
  Download,
  Visibility,
} from '@mui/icons-material';

// Types
export type MenuTreeItem = {
  id: string | number;
  label: string;
  children?: MenuTreeItem[];
};

export type Column = {
  header: string;
  accessor: string;
};

export interface ExportablePageProps {
  title?: string;
  leftContent?: React.ReactNode;
  menuTree?: MenuTreeItem[];
  initialSelected?: Array<string | number>;
  onSelectionChange?: (selected: Array<string | number>) => void;
  columns?: Column[];
  data?: any[];
  onShowMenu?: () => void;
  onSubmit?: (payload: { selectedMenuIds: Array<string | number> }) => void;
  onReset?: () => void;
  enableExport?: boolean;
}

// CheckboxTree Component
const CheckboxTree: React.FC<{
  items?: MenuTreeItem[];
  selected: Array<string | number>;
  onToggle: (id: string | number) => void;
}> = ({ items = [], selected, onToggle }) => {
  const [expandedItems, setExpandedItems] = useState<Array<string | number>>([]);

  const handleExpand = (id: string | number) => {
    setExpandedItems(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  if (!items || items.length === 0) return null;

  return (
    <List dense sx={{ width: '100%', bgcolor: 'background.paper' }}>
      {items.map((item) => {
        const hasChildren = item.children && item.children.length > 0;
        const isExpanded = expandedItems.includes(item.id);

        return (
          <React.Fragment key={String(item.id)}>
            <ListItem
              sx={{
                pl: hasChildren ? 1 : 3,
                '&:hover': {
                  backgroundColor: 'action.hover',
                  borderRadius: 1,
                },
              }}
            >
              {hasChildren && (
                <IconButton
                  size="small"
                  onClick={() => handleExpand(item.id)}
                  sx={{ mr: 1 }}
                >
                  {isExpanded ? <ExpandLess /> : <ExpandMore />}
                </IconButton>
              )}
              {!hasChildren && <Box sx={{ width: 40 }} />}
              <ListItemIcon sx={{ minWidth: 40 }}>
                <Checkbox
                  edge="start"
                  checked={selected.includes(item.id)}
                  onChange={() => onToggle(item.id)}
                  tabIndex={-1}
                  disableRipple
                />
              </ListItemIcon>
              <ListItemText
                primary={
                  <Typography variant="body2" sx={{ fontWeight: hasChildren ? 600 : 400 }}>
                    {item.label}
                  </Typography>
                }
              />
            </ListItem>
            {hasChildren && (
              <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                <Box sx={{ pl: 3 }}>
                  <CheckboxTree items={item.children} selected={selected} onToggle={onToggle} />
                </Box>
              </Collapse>
            )}
          </React.Fragment>
        );
      })}
    </List>
  );
};

// ExportablePage Component
const ExportablePage: React.FC<ExportablePageProps> = ({
  title = 'Exportable Page',
  leftContent,
  menuTree = [],
  initialSelected = [],
  onSelectionChange,
  columns = [],
  data = [],
  onShowMenu,
  onSubmit,
  onReset,
  enableExport = true,
}) => {
  const [selected, setSelected] = useState<Array<string | number>>(initialSelected);

  useEffect(() => {
    setSelected(initialSelected);
  }, [initialSelected]);

  useEffect(() => {
    if (onSelectionChange) onSelectionChange(selected);
  }, [selected]);

  const allIds = useMemo(() => {
    const flattenMenuIds = (items: MenuTreeItem[] = []): Array<string | number> => {
      const ids: Array<string | number> = [];
      const walk = (nodes: MenuTreeItem[]) => {
        for (const n of nodes) {
          ids.push(n.id);
          if (n.children) walk(n.children);
        }
      };
      walk(items);
      return ids;
    };
    return flattenMenuIds(menuTree);
  }, [menuTree]);

  const toggleId = (id: string | number) => {
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  };

  const setAll = (checked: boolean) => {
    setSelected(checked ? [...new Set([...selected, ...allIds])] : []);
  };

  const handleSubmit = () => {
    if (onSubmit) onSubmit({ selectedMenuIds: selected });
  };

  const handleReset = () => {
    setSelected([]);
    if (onReset) onReset();
  };

  const exportCSV = () => {
    if (!columns || !data) return;
    const headers = columns.map((c) => c.header);
    const rows = data.map((row) => columns.map((c) => {
      const v = row[c.accessor];
      return v === undefined || v === null ? '' : String(v).replace(/"/g, '""');
    }));

    const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.replace(/\s+/g, '_').toLowerCase()}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3, width: '100%' }}>
      {/* Left Panel */}
      <Box sx={{ flex: 1 }}>
        <Card elevation={3} sx={{ borderRadius: 2 }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 600, color: 'primary.main' }}>
              {title}
            </Typography>

            <Box sx={{ mb: 3 }}>
              {leftContent}
            </Box>

            <Divider sx={{ my: 2 }} />

            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, flexWrap: 'wrap' }}>
              <Button
                variant="outlined"
                startIcon={<Visibility />}
                onClick={onShowMenu}
                sx={{ flex: { xs: 1, sm: 'none' } }}
              >
                SHOW MENU
              </Button>
              <Button
                variant="contained"
                startIcon={<Save />}
                onClick={handleSubmit}
                sx={{ flex: { xs: 1, sm: 'none' } }}
              >
                SUBMIT
              </Button>
              <Button
                variant="outlined"
                color="error"
                startIcon={<Refresh />}
                onClick={handleReset}
                sx={{ flex: { xs: 1, sm: 'none' } }}
              >
                RESET
              </Button>
              {enableExport && (
                <Button
                  variant="outlined"
                  color="secondary"
                  startIcon={<Download />}
                  onClick={exportCSV}
                  sx={{ flex: { xs: 1, sm: 'none' } }}
                >
                  EXPORT Excel
                </Button>
              )}
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Right Panel */}
      <Box sx={{ width: { xs: '100%', md: 420 } }}>
        <Card elevation={3} sx={{ borderRadius: 2 }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" component="h3" gutterBottom sx={{ fontWeight: 600 }}>
              Assign Menu To Branch
            </Typography>

            <Box sx={{ mb: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={selected.length === allIds.length && allIds.length > 0}
                    onChange={(e) => setAll(e.target.checked)}
                    indeterminate={selected.length > 0 && selected.length < allIds.length}
                  />
                }
                label={
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    Select All
                  </Typography>
                }
              />
              <Chip
                label={`${selected.length} selected`}
                size="small"
                color="primary"
                variant="outlined"
                sx={{ ml: 2 }}
              />
            </Box>

            <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
              <CheckboxTree items={menuTree} selected={selected} onToggle={toggleId} />
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default ExportablePage;