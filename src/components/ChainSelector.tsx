
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { SUPPORTED_CHAINS, ChainConfig } from '@/services/multiChainService';

interface ChainSelectorProps {
  selectedChains: string[];
  onChainToggle: (chainId: string) => void;
  className?: string;
}

const ChainSelector: React.FC<ChainSelectorProps> = ({ 
  selectedChains, 
  onChainToggle, 
  className = '' 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleChainClick = (chainId: string) => {
    onChainToggle(chainId);
  };

  return (
    <Card className={`glass p-4 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-white">Networks</h3>
        <Button
          variant="ghost"
          size="sm"
          className="text-cyan-400 hover:text-cyan-300"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? 'Less' : 'More'}
        </Button>
      </div>
      
      <div className={`grid gap-2 ${isExpanded ? 'grid-cols-1' : 'grid-cols-2'}`}>
        {SUPPORTED_CHAINS.map((chain) => {
          const isSelected = selectedChains.includes(chain.id);
          return (
            <Button
              key={chain.id}
              variant="ghost"
              size="sm"
              className={`justify-start glass h-auto p-3 ${
                isSelected 
                  ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-400' 
                  : 'hover:bg-white/10'
              }`}
              onClick={() => handleChainClick(chain.id)}
            >
              <div className="flex items-center space-x-2 w-full">
                <span className="text-lg">{chain.icon}</span>
                <div className="flex-1 text-left">
                  <div className="font-medium text-white text-sm">{chain.name}</div>
                  {isExpanded && (
                    <div className="text-xs text-gray-400">{chain.symbol}</div>
                  )}
                </div>
                {isSelected && (
                  <Badge variant="secondary" className="text-xs bg-cyan-500/30 text-cyan-400">
                    Active
                  </Badge>
                )}
              </div>
            </Button>
          );
        })}
      </div>
      
      {selectedChains.length > 0 && (
        <div className="mt-3 pt-3 border-t border-white/10">
          <p className="text-xs text-gray-400">
            {selectedChains.length} network{selectedChains.length > 1 ? 's' : ''} selected
          </p>
        </div>
      )}
    </Card>
  );
};

export default ChainSelector;
