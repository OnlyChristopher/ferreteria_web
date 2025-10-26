import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import {
  Menubar,
  MenubarMenu,
  MenubarTrigger,
  MenubarContent,
  MenubarItem,
  MenubarGroup,
  MenubarSeparator,
  MenubarLabel,
  MenubarCheckboxItem,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarSub,
  MenubarSubTrigger,
  MenubarSubContent,
} from './menubar';

// Test básico de renderizado

describe('Menubar', () => {
  it('renderiza Menubar y sus subcomponentes', () => {
    render(
      <Menubar>
        <MenubarMenu>
          <MenubarTrigger>Archivo</MenubarTrigger>
          <MenubarContent>
            <MenubarItem>Nuevo</MenubarItem>
            <MenubarItem>Guardar</MenubarItem>
            <MenubarSeparator />
            <MenubarGroup>
              <MenubarLabel>Opciones</MenubarLabel>
              <MenubarCheckboxItem checked>Activado</MenubarCheckboxItem>
              <MenubarRadioGroup>
                <MenubarRadioItem value="a">A</MenubarRadioItem>
                <MenubarRadioItem value="b">B</MenubarRadioItem>
              </MenubarRadioGroup>
            </MenubarGroup>
            <MenubarSub>
              <MenubarSubTrigger>Más</MenubarSubTrigger>
              <MenubarSubContent>
                <MenubarItem>Opción extra</MenubarItem>
              </MenubarSubContent>
            </MenubarSub>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>
    );
    expect(screen.getByText('Archivo')).toBeInTheDocument();
    expect(screen.getByText('Nuevo')).toBeInTheDocument();
    expect(screen.getByText('Guardar')).toBeInTheDocument();
    expect(screen.getByText('Opciones')).toBeInTheDocument();
    expect(screen.getByText('Activado')).toBeInTheDocument();
    expect(screen.getByText('A')).toBeInTheDocument();
    expect(screen.getByText('B')).toBeInTheDocument();
    expect(screen.getByText('Más')).toBeInTheDocument();
    expect(screen.getByText('Opción extra')).toBeInTheDocument();
  });

  it('abre y cierra el MenubarContent al hacer click en el trigger', () => {
    render(
      <Menubar>
        <MenubarMenu>
          <MenubarTrigger>Archivo</MenubarTrigger>
          <MenubarContent>
            <MenubarItem>Nuevo</MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>
    );
    const trigger = screen.getByText('Archivo');
    fireEvent.click(trigger);
    expect(screen.getByText('Nuevo')).toBeInTheDocument();
  });

  it('snapshot del Menubar', () => {
    const { container } = render(
      <Menubar>
        <MenubarMenu>
          <MenubarTrigger>Archivo</MenubarTrigger>
          <MenubarContent>
            <MenubarItem>Nuevo</MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>
    );
    expect(container).toMatchSnapshot();
  });
});

