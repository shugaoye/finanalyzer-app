// Parameter component styling utilities

export const parameterContainerClasses = "mb-4";

export const parameterLabelClasses = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1";

export const parameterDescriptionClasses = "text-xs text-gray-500 dark:text-gray-400 mb-2";

export const parameterErrorClasses = "text-red-500 text-xs mt-1";

export const parameterInputClasses = {
  base: "w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-dark-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500",
  error: "border-red-500 dark:border-red-400",
  disabled: "bg-gray-100 dark:bg-dark-700 cursor-not-allowed text-gray-400 dark:text-dark-400",
};

export const parameterSelectClasses = {
  base: "w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-dark-800 text-gray-900 dark:text-white cursor-pointer",
  error: "border-red-500 dark:border-red-400",
  disabled: "bg-gray-100 dark:bg-dark-700 cursor-not-allowed text-gray-400 dark:text-dark-400",
};

export const parameterCheckboxClasses = "h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600";

export const parameterColorClasses = "w-full h-10 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500";

export const parameterButtonClasses = {
  primary: "px-4 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-md font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-dark-900 border border-blue-700 dark:border-blue-500 shadow-md",
  secondary: "px-4 py-2 bg-gray-100 hover:bg-gray-200 active:bg-gray-300 text-gray-800 rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-gray-500 dark:bg-dark-700 dark:text-gray-200 dark:hover:bg-dark-600 dark:active:bg-dark-500 border border-gray-300 dark:border-dark-600",
  disabled: "opacity-50 cursor-not-allowed",
  loading: "opacity-75 cursor-not-allowed",
};

export const parameterCardClasses = "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-sm p-4";

export const parameterLoadingClasses = "flex items-center justify-center p-4 text-gray-500 dark:text-gray-400";

export const parameterSuccessClasses = "p-2 bg-green-100 border border-green-400 rounded-md text-green-700 dark:bg-green-900 dark:border-green-800 dark:text-green-300";

export const parameterErrorContainerClasses = "p-2 bg-red-100 border border-red-400 rounded-md text-red-700 dark:bg-red-900 dark:border-red-800 dark:text-red-300";

export const parameterFormClasses = "space-y-4";

export const parameterFormGroupClasses = "mb-3";

export const parameterFormRowClasses = "flex items-center justify-between space-x-2";

export const parameterDropdownClasses = {
  container: "relative",
  menu: "absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md shadow-lg max-h-60 overflow-y-auto",
  item: "w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700",
  itemActive: "bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-400",
  itemInactive: "text-gray-700 dark:text-gray-300",
};

export const parameterGridClasses = {
  base: "grid grid-cols-1 md:grid-cols-2 gap-4",
  single: "grid-cols-1",
  double: "grid-cols-1 md:grid-cols-2",
  triple: "grid-cols-1 md:grid-cols-3",
};

export const parameterTooltipClasses = "relative inline-block";

export const parameterTooltipTextClasses = "absolute z-10 bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs bg-gray-900 text-white rounded opacity-0 invisible transition-all duration-200 tooltip";

export const parameterTooltipHoverClasses = "opacity-100 visible";