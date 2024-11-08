export interface Filter {
  category: string
  title: string
  options: string[]
  selectedOptions: string[]
  filterType?: 'switch' // default is checkboxList
  switchLabel?: string
}

export interface SelectedFilter {
  [category: string]: string[]
}
