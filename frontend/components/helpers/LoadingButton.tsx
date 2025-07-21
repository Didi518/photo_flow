import { LoaderIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';

interface Props extends React.ComponentPropsWithoutRef<typeof Button> {
  isLoading: boolean;
  children: React.ReactNode;
}

const LoadingButton = ({ isLoading, children, ...props }: Props) => {
  return (
    <Button disabled={isLoading} {...props}>
      {isLoading && <LoaderIcon className="animate-spin mr-2" />}
      {children}
    </Button>
  );
};

export default LoadingButton;
