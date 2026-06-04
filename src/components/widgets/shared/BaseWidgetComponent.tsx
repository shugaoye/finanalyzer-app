import React from 'react';
import type { WidgetInstanceProps } from '../../../types/widgets';
import { WidgetWrapper } from '../WidgetWrapper';

interface BaseWidgetState {
  isLoading: boolean;
  error: string | null;
  data: unknown | null;
}

export abstract class BaseWidgetComponent extends React.Component<WidgetInstanceProps, BaseWidgetState> {
  constructor(props: WidgetInstanceProps) {
    super(props);
    this.state = {
      isLoading: false,
      error: null,
      data: null
    };
  }

  abstract fetchData(params: Record<string, unknown>): Promise<unknown>;
  abstract renderContent(data: unknown): JSX.Element;

  protected async loadData() {
    const { widget } = this.props;
    const params = widget.currentParams || {};

    this.setState({ isLoading: true, error: null });

    try {
      const data = await this.fetchData(params);
      this.setState({ data, isLoading: false });
    } catch (error) {
      this.setState({
        error: error instanceof Error ? error.message : 'Failed to load data',
        isLoading: false
      });
    }
  }

  componentDidMount() {
    this.loadData();
  }

  componentDidUpdate(prevProps: WidgetInstanceProps) {
    const prevParams = prevProps.widget.currentParams;
    const currentParams = this.props.widget.currentParams;

    if (JSON.stringify(prevParams) !== JSON.stringify(currentParams)) {
      this.loadData();
    }
  }

  handleRefresh = () => {
    this.loadData();
    if (this.props.onRefresh) {
      this.props.onRefresh();
    }
  };

  render() {
    const { isLoading, error, data } = this.state;

    return (
      <WidgetWrapper isLoading={isLoading}>
        {error && (
          <div className="flex items-center justify-center h-full text-red-500">
            {error}
          </div>
        )}
        {data !== null && this.renderContent(data)}
      </WidgetWrapper>
    );
  }
}
