import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

interface CostDisplayProps {
  workflowInstanceId: string
}

export function CostDisplay({ workflowInstanceId }: CostDisplayProps) {
  const [totalCost, setTotalCost] = useState(0)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    const fetchCost = async () => {
      try {
        const { data, error } = await supabase
          .from('step_executions')
          .select('cost')
          .eq('workflow_instance_id', workflowInstanceId)
        
        if (error) {
          console.error('Error fetching costs:', error)
          return
        }
        
        const total = data?.reduce((sum, exec) => sum + (exec.cost || 0), 0) || 0
        setTotalCost(total)
      } catch (error) {
        console.error('Error calculating costs:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchCost()
    
    // Subscribe to updates
    const subscription = supabase
      .channel('cost-updates')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'step_executions',
        filter: `workflow_instance_id=eq.${workflowInstanceId}`
      }, fetchCost)
      .subscribe()
    
    return () => {
      subscription.unsubscribe()
    }
  }, [workflowInstanceId])
  
  if (loading) {
    return (
      <div className="bg-gray-50 p-4 rounded-lg animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
        <div className="h-3 bg-gray-200 rounded w-3/4"></div>
      </div>
    )
  }
  
  const traditionalCost = 15000 // Estimated traditional cost
  const savings = traditionalCost - totalCost
  
  return (
    <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
      <h3 className="font-semibold text-green-800 mb-2">💰 AI Cost Analysis</h3>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600">AI Processing Cost:</span>
          <span className="font-medium text-green-700">${totalCost.toFixed(4)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Traditional Cost:</span>
          <span className="font-medium text-gray-700">~${traditionalCost.toLocaleString()}</span>
        </div>
        <div className="border-t border-green-200 pt-2">
          <div className="flex justify-between">
            <span className="font-medium text-green-800">You Saved:</span>
            <span className="font-bold text-green-800">${savings.toLocaleString()}</span>
          </div>
          <div className="text-xs text-green-600 mt-1">
            {((savings / traditionalCost) * 100).toFixed(1)}% cost reduction
          </div>
        </div>
      </div>
    </div>
  )
} 