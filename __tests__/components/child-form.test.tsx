import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ChildForm } from "@/components/ChildForm";

describe("ChildForm", () => {
  const mockOnSubmit = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render name, DOB, and gender fields", () => {
    render(<ChildForm onSubmit={mockOnSubmit} />);

    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/date of birth/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/gender/i)).toBeInTheDocument();
  });

  it("should show validation error when name is empty on submit", async () => {
    render(<ChildForm onSubmit={mockOnSubmit} />);

    fireEvent.click(screen.getByRole("button", { name: /save/i }));

    await waitFor(() => {
      expect(screen.getByText(/name is required/i)).toBeInTheDocument();
    });
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it("should show validation error when DOB is empty on submit", async () => {
    render(<ChildForm onSubmit={mockOnSubmit} />);

    const nameInput = screen.getByLabelText(/name/i);
    fireEvent.change(nameInput, { target: { value: "Max" } });

    fireEvent.click(screen.getByRole("button", { name: /save/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/date of birth is required/i)
      ).toBeInTheDocument();
    });
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it("should call onSubmit with correct data when form is valid", async () => {
    render(<ChildForm onSubmit={mockOnSubmit} />);

    fireEvent.change(screen.getByLabelText(/name/i), {
      target: { value: "Max" },
    });
    fireEvent.change(screen.getByLabelText(/date of birth/i), {
      target: { value: "2023-06-15" },
    });
    fireEvent.change(screen.getByLabelText(/gender/i), {
      target: { value: "male" },
    });

    fireEvent.click(screen.getByRole("button", { name: /save/i }));

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          name: "Max",
          date_of_birth: "2023-06-15",
          gender: "male",
        })
      );
    });
  });

  it("should show premature checkbox", () => {
    render(<ChildForm onSubmit={mockOnSubmit} />);

    expect(screen.getByLabelText(/premature/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/premature/i)).toHaveAttribute(
      "type",
      "checkbox"
    );
  });

  it("should show optional allergies textarea", () => {
    render(<ChildForm onSubmit={mockOnSubmit} />);

    expect(screen.getByLabelText(/allergies/i)).toBeInTheDocument();
  });

  it("should pre-fill fields when editing an existing child", () => {
    const existingChild = {
      name: "Lisa",
      date_of_birth: "2022-03-10",
      gender: "female" as const,
      is_premature: true,
      allergies: "Peanuts",
      notes: "Born 4 weeks early",
    };

    render(<ChildForm onSubmit={mockOnSubmit} initialData={existingChild} />);

    expect(screen.getByLabelText(/name/i)).toHaveValue("Lisa");
    expect(screen.getByLabelText(/date of birth/i)).toHaveValue("2022-03-10");
    expect(screen.getByLabelText(/gender/i)).toHaveValue("female");
    expect(screen.getByLabelText(/premature/i)).toBeChecked();
    expect(screen.getByLabelText(/allergies/i)).toHaveValue("Peanuts");
  });
});
