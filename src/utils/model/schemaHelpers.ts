export function schemaToProps<S, P extends string>(obj: any, props: P): Partial<S> {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const object = obj.toObject();
  const arrProps = props.split(' ');
  for (const key of Object.keys(object)) if (arrProps.indexOf(key) < 0) delete object[key];
  return object;
}
