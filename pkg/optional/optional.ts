type Nothing = {};

type OptionalTime = SomeTime | Nothing;

type SomeTime = {
  value: Date;
};

function newOptionalTime(t: Date | null): OptionalTime {
  if (t === null) {
    return {};
  } else {
    return { value: t };
  }
}

function orElseTime(o: OptionalTime, def: Date): Date {
  if ("value" in o) {
    return o.value;
  } else {
    return def;
  }
}

type OptionalInt = SomeInt | Nothing;

type SomeInt = {
  value: number;
};

function newOptionalInt(t: number | null): OptionalInt {
  if (t === null) {
    return {};
  } else {
    return { value: t };
  }
}

function orElseInt(o: OptionalInt, def: number): number {
  if ("value" in o) {
    return o.value;
  } else {
    return def;
  }
}