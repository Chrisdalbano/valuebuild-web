# 🎨 ShadCN-Inspired UI Redesign - Complete Guide

## ✅ Completed Updates

### 1. **Global Styles** (`gold-league/src/style.css`)
- ✅ New CSS variables with your color palette
- ✅ Gold: `rgb(240, 168, 41)`
- ✅ Rust: `rgb(135, 64, 55)`
- ✅ Slate: `rgb(100, 100, 108)`
- ✅ Dark backgrounds, subtle borders, minimal shadows
- ✅ Modern typography with Inter/SF Pro fonts
- ✅ Focus states with gold outlines

### 2. **Main App** (`gold-league/src/App.vue`)
- ✅ Header with gold title
- ✅ Subtle shadows instead of heavy gradients  
- ✅ Tab navigation with bottom borders
- ✅ Clean button styles with rust/gold accents
- ✅ Info cards with minimal borders
- ✅ Smooth transitions and hover states

## 🔧 Next Steps - Component Updates

### ItemTable.vue
Replace the `<style scoped>` section with:

```css
<style scoped>
.item-table-container {
  width: 100%;
  padding: 1.5rem;
  background: var(--bg-secondary);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-primary);
  box-shadow: var(--shadow-sm);
}

.controls {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  align-items: center;
}

.search-bar {
  flex: 1;
  min-width: 250px;
}

.search-input {
  width: 100%;
  padding: 0.625rem 1rem;
  font-size: 0.875rem;
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
  background: var(--bg-tertiary);
  color: var(--text-primary);
  transition: all 0.2s ease;
}

.search-input::placeholder {
  color: var(--text-tertiary);
}

.search-input:focus {
  outline: none;
  border-color: var(--gold);
  box-shadow: 0 0 0 2px rgba(240, 168, 41, 0.1);
}

.filter-group {
  display: flex;
  gap: 0.625rem;
  align-items: center;
  color: var(--text-primary);
}

.filter-group label {
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--text-secondary);
}

.filter-select, .cost-input {
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
  background: var(--bg-tertiary);
  color: var(--text-primary);
  font-size: 0.8125rem;
  transition: all 0.2s ease;
}

.filter-select:focus, .cost-input:focus {
  outline: none;
  border-color: var(--gold);
}

.cost-input {
  width: 90px;
}

.btn {
  padding: 0.5rem 1rem;
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  background: var(--bg-tertiary);
  color: var(--text-primary);
  font-size: 0.8125rem;
}

.btn:hover:not(:disabled) {
  background: var(--bg-hover);
  border-color: var(--border-secondary);
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary {
  background: var(--gold);
  color: var(--bg-primary);
  border-color: var(--gold);
}

.btn-primary:hover:not(:disabled) {
  background: rgb(220, 148, 21);
  box-shadow: var(--shadow-md);
}

.btn-secondary {
  background: var(--rust);
  color: var(--text-primary);
  border-color: var(--rust);
}

.btn-secondary:hover {
  background: rgb(155, 84, 75);
}

.compare-controls {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.table-wrapper {
  overflow-x: auto;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-primary);
}

.items-table {
  width: 100%;
  border-collapse: collapse;
  background: var(--bg-tertiary);
}

.items-table thead {
  background: var(--bg-secondary);
  position: sticky;
  top: 0;
  border-bottom: 1px solid var(--border-primary);
}

.items-table th {
  padding: 0.875rem 1rem;
  text-align: left;
  color: var(--text-secondary);
  font-weight: 600;
  text-transform: uppercase;
  font-size: 0.75rem;
  letter-spacing: 0.05em;
}

.items-table th.sortable {
  cursor: pointer;
  user-select: none;
  transition: color 0.2s ease;
}

.items-table th.sortable:hover {
  color: var(--gold);
}

.items-table tbody tr {
  border-bottom: 1px solid var(--border-primary);
  transition: background 0.2s ease;
}

.items-table tbody tr:hover {
  background: var(--bg-hover);
  cursor: pointer;
}

.items-table tbody tr:last-child {
  border-bottom: none;
}

.items-table td {
  padding: 0.875rem 1rem;
  color: var(--text-primary);
  font-size: 0.875rem;
}

.item-name {
  font-weight: 500;
}

.item-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  position: relative;
}

.item-info:hover .item-tooltip {
  display: block;
}

.item-icon {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border-secondary);
}

.item-tooltip {
  display: none;
  position: absolute;
  left: 50px;
  top: 50%;
  transform: translateY(-50%);
  background: var(--bg-primary);
  border: 1px solid var(--border-secondary);
  border-radius: var(--radius-md);
  padding: 1rem;
  min-width: 300px;
  max-width: 400px;
  z-index: 1000;
  box-shadow: var(--shadow-xl);
  color: var(--text-secondary);
  font-size: 0.8125rem;
  line-height: 1.5;
  font-weight: normal;
  pointer-events: none;
}

.item-tooltip::before {
  content: '';
  position: absolute;
  left: -6px;
  top: 50%;
  transform: translateY(-50%);
  width: 0;
  height: 0;
  border-top: 6px solid transparent;
  border-bottom: 6px solid transparent;
  border-right: 6px solid var(--border-secondary);
}

.cost, .gold-value {
  font-family: 'Monaco', 'Courier New', monospace;
  font-weight: 600;
  color: var(--gold);
  font-size: 0.875rem;
}

.eff-excellent { color: var(--success); font-weight: 700; }
.eff-good { color: var(--info); font-weight: 600; }
.eff-fair { color: var(--warning); font-weight: 600; }
.eff-poor { color: var(--error); font-weight: 600; }

.rating-excellent { color: var(--success); }
.rating-good { color: var(--info); }
.rating-fair { color: var(--warning); }
.rating-poor { color: var(--error); }

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 1.5rem;
}

.page-info {
  color: var(--text-secondary);
  font-weight: 500;
  font-size: 0.875rem;
}

.per-page-select {
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
  background: var(--bg-tertiary);
  color: var(--text-primary);
  font-size: 0.8125rem;
}

@media (max-width: 768px) {
  .controls {
    flex-direction: column;
    align-items: stretch;
  }
  
  .search-bar {
    width: 100%;
  }
}
</style>
```

### ItemCompare.vue
Replace the `<style scoped>` section with similar updates using the new variables.

### ItemChart.vue
Replace the `<style scoped>` section with similar updates using the new variables.

## 🎨 Design System Summary

### Colors
- **Gold** (`--gold`): Primary action color, highlights
- **Rust** (`--rust`): Secondary actions, danger states  
- **Slate** (`--slate`): Tertiary elements, disabled states
- **Success**: Green `rgb(34, 197, 94)`
- **Warning**: Yellow `rgb(234, 179, 8)`
- **Error**: Red `rgb(239, 68, 68)`

### Backgrounds
- **Primary**: `rgb(12, 12, 14)` - Main bg
- **Secondary**: `rgb(18, 18, 20)` - Cards, header
- **Tertiary**: `rgb(24, 24, 27)` - Inputs, nested elements
- **Hover**: `rgb(32, 32, 36)` - Interactive states

### Typography
- Font family: SF Pro, Inter, System UI
- Sizes: 0.75rem - 2.5rem
- Weights: 400 (regular), 500 (medium), 600 (semibold), 700 (bold)
- Letter spacing: -0.025em to 0.05em

### Spacing
- Uses rem units: 0.375rem, 0.5rem, 0.75rem, 1rem, 1.5rem, 2rem
- Consistent gap values
- Padding scales with component size

### Shadows
- **sm**: Subtle card shadows
- **md**: Button hovers
- **lg**: Modals, dropdowns
- **xl**: Tooltips, popovers

### Borders
- Primary: `rgb(39, 39, 42)` - Main borders
- Secondary: `rgb(63, 63, 70)` - Hover/focus states
- Radius: 0.375rem (sm), 0.5rem (md), 0.75rem (lg), 1rem (xl)

## 🚀 Quick Apply

To apply all changes instantly, replace the `<style scoped>` sections in:
1. ✅ `style.css` - DONE
2. ✅ `App.vue` - DONE
3. `ItemTable.vue` - Use code above
4. `ItemCompare.vue` - Similar pattern
5. `ItemChart.vue` - Similar pattern

The design is now cleaner, more professional, and easier to read!

