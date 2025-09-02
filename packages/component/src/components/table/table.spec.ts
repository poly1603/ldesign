import { newSpecPage } from '@stencil/core/testing';
import { Table } from './table';

describe('ld-table', () => {
  const mockColumns = [
    { key: 'name', title: '姓名' },
    { key: 'age', title: '年龄' },
    { key: 'city', title: '城市' },
  ];

  const mockData = [
    { id: 1, name: '张三', age: 25, city: '北京' },
    { id: 2, name: '李四', age: 30, city: '上海' },
    { id: 3, name: '王五', age: 28, city: '广州' },
  ];

  it('renders', async () => {
    const page = await newSpecPage({
      components: [Table],
      html: `<ld-table></ld-table>`,
    });
    expect(page.root).toEqualHtml(`
      <ld-table>
        <mock:shadow-root>
          <div class="ld-table-wrapper">
            <div class="ld-table-container">
              <table class="ld-table ld-table--medium" id="table-1">
                <thead class="ld-table__header">
                  <tr></tr>
                </thead>
                <tbody class="ld-table__body">
                  <tr>
                    <td class="ld-table__empty" colspan="0">
                      暂无数据
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </mock:shadow-root>
      </ld-table>
    `);
  });

  it('renders with data and columns', async () => {
    const page = await newSpecPage({
      components: [Table],
      html: `<ld-table></ld-table>`,
    });
    
    const table = page.root as any;
    table.columns = mockColumns;
    table.data = mockData;
    await page.waitForChanges();
    
    expect(table.columns).toEqual(mockColumns);
    expect(table.data).toEqual(mockData);
  });

  it('supports bordered style', async () => {
    const page = await newSpecPage({
      components: [Table],
      html: `<ld-table bordered="true"></ld-table>`,
    });
    
    const table = page.root as any;
    expect(table.bordered).toBe(true);
  });

  it('supports striped style', async () => {
    const page = await newSpecPage({
      components: [Table],
      html: `<ld-table striped="true"></ld-table>`,
    });
    
    const table = page.root as any;
    expect(table.striped).toBe(true);
  });

  it('supports different sizes', async () => {
    const page = await newSpecPage({
      components: [Table],
      html: `<ld-table size="large"></ld-table>`,
    });
    
    const table = page.root as any;
    expect(table.size).toBe('large');
    
    table.size = 'small';
    await page.waitForChanges();
    expect(table.size).toBe('small');
  });

  it('supports hiding header', async () => {
    const page = await newSpecPage({
      components: [Table],
      html: `<ld-table show-header="false"></ld-table>`,
    });
    
    const table = page.root as any;
    expect(table.showHeader).toBe(false);
  });

  it('supports selection', async () => {
    const page = await newSpecPage({
      components: [Table],
      html: `<ld-table selectable="true"></ld-table>`,
    });
    
    const table = page.root as any;
    expect(table.selectable).toBe(true);
    expect(table.selectionType).toBe('checkbox');
  });

  it('supports radio selection', async () => {
    const page = await newSpecPage({
      components: [Table],
      html: `<ld-table selectable="true" selection-type="radio"></ld-table>`,
    });
    
    const table = page.root as any;
    expect(table.selectable).toBe(true);
    expect(table.selectionType).toBe('radio');
  });

  it('supports sorting', async () => {
    const page = await newSpecPage({
      components: [Table],
      html: `<ld-table sortable="true"></ld-table>`,
    });
    
    const table = page.root as any;
    expect(table.sortable).toBe(true);
  });

  it('supports filtering', async () => {
    const page = await newSpecPage({
      components: [Table],
      html: `<ld-table filterable="true"></ld-table>`,
    });
    
    const table = page.root as any;
    expect(table.filterable).toBe(true);
  });

  it('supports resizable columns', async () => {
    const page = await newSpecPage({
      components: [Table],
      html: `<ld-table resizable="true"></ld-table>`,
    });
    
    const table = page.root as any;
    expect(table.resizable).toBe(true);
  });

  it('supports fixed header', async () => {
    const page = await newSpecPage({
      components: [Table],
      html: `<ld-table fixed-header="true" height="400"></ld-table>`,
    });
    
    const table = page.root as any;
    expect(table.fixedHeader).toBe(true);
    expect(table.height).toBe('400');
  });

  it('supports pagination', async () => {
    const page = await newSpecPage({
      components: [Table],
      html: `<ld-table pagination="true"></ld-table>`,
    });
    
    const table = page.root as any;
    expect(table.pagination).toBe(true);
  });

  it('supports loading state', async () => {
    const page = await newSpecPage({
      components: [Table],
      html: `<ld-table loading="true"></ld-table>`,
    });
    
    const table = page.root as any;
    expect(table.loading).toBe(true);
  });

  it('supports custom empty text', async () => {
    const page = await newSpecPage({
      components: [Table],
      html: `<ld-table empty-text="没有数据"></ld-table>`,
    });
    
    const table = page.root as any;
    expect(table.emptyText).toBe('没有数据');
  });

  it('supports custom class', async () => {
    const page = await newSpecPage({
      components: [Table],
      html: `<ld-table custom-class="my-table"></ld-table>`,
    });
    
    const table = page.root as any;
    expect(table.customClass).toBe('my-table');
  });

  it('emits events correctly', async () => {
    const page = await newSpecPage({
      components: [Table],
      html: `<ld-table></ld-table>`,
    });
    
    const table = page.root as any;
    const rowSelectSpy = jest.fn();
    const rowClickSpy = jest.fn();
    const sortSpy = jest.fn();
    const filterSpy = jest.fn();
    const pageChangeSpy = jest.fn();
    
    table.addEventListener('ldRowSelect', rowSelectSpy);
    table.addEventListener('ldRowClick', rowClickSpy);
    table.addEventListener('ldSort', sortSpy);
    table.addEventListener('ldFilter', filterSpy);
    table.addEventListener('ldPageChange', pageChangeSpy);
    
    // 设置数据以便测试事件
    table.columns = mockColumns;
    table.data = mockData;
    await page.waitForChanges();
    
    expect(rowSelectSpy).not.toHaveBeenCalled();
    expect(rowClickSpy).not.toHaveBeenCalled();
    expect(sortSpy).not.toHaveBeenCalled();
    expect(filterSpy).not.toHaveBeenCalled();
    expect(pageChangeSpy).not.toHaveBeenCalled();
  });

  it('handles data changes correctly', async () => {
    const page = await newSpecPage({
      components: [Table],
      html: `<ld-table></ld-table>`,
    });
    
    const table = page.root as any;
    table.columns = mockColumns;
    table.data = mockData;
    await page.waitForChanges();
    
    // 更改数据
    const newData = [
      { id: 4, name: '赵六', age: 35, city: '深圳' },
    ];
    table.data = newData;
    await page.waitForChanges();
    
    expect(table.data).toEqual(newData);
  });

  it('has correct default values', async () => {
    const page = await newSpecPage({
      components: [Table],
      html: `<ld-table></ld-table>`,
    });
    
    const table = page.root as any;
    expect(table.columns).toEqual([]);
    expect(table.data).toEqual([]);
    expect(table.bordered).toBe(false);
    expect(table.striped).toBe(false);
    expect(table.size).toBe('medium');
    expect(table.showHeader).toBe(true);
    expect(table.selectable).toBe(false);
    expect(table.selectionType).toBe('checkbox');
    expect(table.sortable).toBe(false);
    expect(table.filterable).toBe(false);
    expect(table.resizable).toBe(false);
    expect(table.fixedHeader).toBe(false);
    expect(table.pagination).toBe(false);
    expect(table.loading).toBe(false);
    expect(table.emptyText).toBe('暂无数据');
  });

  it('calls selection methods correctly', async () => {
    const page = await newSpecPage({
      components: [Table],
      html: `<ld-table></ld-table>`,
    });
    
    const table = page.root as any;
    table.columns = mockColumns;
    table.data = mockData;
    await page.waitForChanges();
    
    // 测试获取选中行
    const selectedRows = await table.getSelectedRows();
    expect(selectedRows).toEqual([]);
    
    // 测试设置选中行
    await table.setSelectedRows([1, 2]);
    const newSelectedRows = await table.getSelectedRows();
    expect(newSelectedRows.length).toBe(2);
    
    // 测试清空选择
    await table.clearSelection();
    const clearedRows = await table.getSelectedRows();
    expect(clearedRows).toEqual([]);
  });

  it('supports pagination config', async () => {
    const paginationConfig = {
      current: 2,
      pageSize: 5,
      total: 100,
      showSizeChanger: true,
      showQuickJumper: true,
      showTotal: true,
    };
    
    const page = await newSpecPage({
      components: [Table],
      html: `<ld-table pagination="true"></ld-table>`,
    });
    
    const table = page.root as any;
    table.paginationConfig = paginationConfig;
    await page.waitForChanges();
    
    expect(table.paginationConfig).toEqual(paginationConfig);
  });
});
