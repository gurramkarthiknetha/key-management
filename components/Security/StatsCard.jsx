import { Card } from '../ui';

const StatsCard = ({ 
  title, 
  value, 
  icon, 
  color = 'primary',
  subtitle,
  className = ""
}) => {
  const colorClasses = {
    primary: 'text-primary-600 bg-primary-100',
    success: 'text-green-600 bg-green-100',
    warning: 'text-yellow-600 bg-yellow-100',
    danger: 'text-red-600 bg-red-100',
    gray: 'text-gray-600 bg-gray-100',
  };

  return (
    <Card className={`${className}`} padding="md">
      <div className="flex items-center">
        <div className={`p-3 rounded-xl ${colorClasses[color]}`}>
          {icon}
        </div>
        <div className="ml-4 flex-1">
          <p className="text-sm font-medium text-gray-600">
            {title}
          </p>
          <p className="text-2xl font-bold text-gray-900">
            {value}
          </p>
          {subtitle && (
            <p className="text-xs text-gray-500 mt-1">
              {subtitle}
            </p>
          )}
        </div>
      </div>
    </Card>
  );
};

export default StatsCard;
