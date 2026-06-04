import { cn } from '../utils/cn';

interface ApplicationCardProps {
  name: string;
  img: string;
  imgDark?: string;
  imgLight?: string;
  description: string;
  allowCustomization: boolean;
  onClick?: () => void;
}

function ApplicationCard({ 
  name, 
  img, 
  description, 
  allowCustomization, 
  onClick 
}: ApplicationCardProps): JSX.Element {
  return (
    <div 
      className={cn(
        'bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 hover:shadow-lg transition-all duration-200 cursor-pointer',
        'flex flex-col items-center text-center'
      )}
      onClick={onClick}
    >
      <div className="w-16 h-16 mb-4 flex items-center justify-center">
        <img 
          src={img} 
          alt={name} 
          className="w-full h-full object-cover rounded-md"
        />
      </div>
      <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
        {name}
      </h3>
      <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
        {description}
      </p>
      {allowCustomization && (
        <div className="text-xs text-blue-500 dark:text-blue-400">
          可自定义
        </div>
      )}
    </div>
  );
}

export default ApplicationCard;